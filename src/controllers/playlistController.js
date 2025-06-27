import { Playlist } from "../models/Playlist.js";
import { Song } from "../models/Song.js";

// Create a new playlist
export const createPlaylist = async (req, res) => {
  try {
    const { name, description, songs } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Playlist name is required",
      });
    }

    // Check if playlist with same name already exists for this user
    const existingPlaylist = await Playlist.findOne({
      name: name,
      userId: userId,
    });

    if (existingPlaylist) {
      return res.status(409).json({
        success: false,
        message: "A playlist with this name already exists",
        data: existingPlaylist,
      });
    }

    // Check if songs exist if provided
    if (songs && songs.length > 0) {
      const existingSongs = await Song.find({ _id: { $in: songs } });
      if (existingSongs.length !== songs.length) {
        return res.status(400).json({
          success: false,
          message: "One or more songs not found",
        });
      }
    }

    const playlist = new Playlist({
      name,
      description: description || "",
      userId: userId,
      songs: songs || [],
    });

    await playlist.save();

    // Populate user and songs for response
    await playlist.populate([
      { path: "userId", select: "username email" },
      { path: "songs", select: "title artist album" },
    ]);

    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      data: playlist,
    });
  } catch (error) {
    console.error("Create playlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all playlists for the authenticated user
export const getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, search } = req.query;

    const query = { userId: userId };

    // Add search functionality
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const playlists = await Playlist.find(query)
      .populate("userId", "username email")
      .populate("songs", "title artist album")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Playlist.countDocuments(query);

    res.status(200).json({
      success: true,
      data: playlists,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get user playlists error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific playlist by ID
export const getPlaylistById = async (req, res) => {
  try {
    const { id: playlistId } = req.params;
    const userId = req.user.userId;

    const playlist = await Playlist.findOne({ _id: playlistId, userId: userId })
      .populate("userId", "username email")
      .populate(
        "songs",
        "title artists album duration cover spotifyId spotifyUrl"
      );

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    res.status(200).json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    console.error("Get playlist by ID error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update a playlist
export const updatePlaylist = async (req, res) => {
  try {
    const { id: playlistId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.userId;

    console.log({ name, description, playlistId, userId });

    // Find playlist and ensure user owns it
    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: userId,
    });
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Update fields
    if (name !== undefined) playlist.name = name;
    if (description !== undefined) playlist.description = description;

    await playlist.save();

    // Populate for response
    await playlist.populate([
      { path: "userId", select: "username email" },
      { path: "songs", select: "title artist album" },
    ]);

    res.status(200).json({
      success: true,
      message: "Playlist updated successfully",
      data: playlist,
    });
  } catch (error) {
    console.error("Update playlist error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a playlist
export const deletePlaylist = async (req, res) => {
  try {
    const { id: playlistId } = req.params;
    const userId = req.user.userId;

    const playlist = await Playlist.findOneAndDelete({
      _id: playlistId,
      userId: userId,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    console.error("Delete playlist error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Add song to playlist
export const addSongToPlaylist = async (req, res) => {
  try {
    const { id: playlistId } = req.params;
    const songData = req.body; // Single song object, not wrapped in songs array
    const userId = req.user.userId;

    if (!songData || typeof songData !== "object") {
      return res.status(400).json({
        success: false,
        message: "Song data is required",
      });
    }

    // Validate song object structure
    if (
      !songData.title ||
      !songData.artists ||
      !Array.isArray(songData.artists) ||
      songData.artists.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Song must have title and artists array",
      });
    }

    // Find playlist and ensure user owns it
    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: userId,
    });
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Check if song exists by spotifyId (if provided) or by title + artists combination
    let existingSong = null;

    if (songData.spotifyId) {
      existingSong = await Song.findOne({ spotifyId: songData.spotifyId });
    }

    if (!existingSong) {
      // Try to find by title and artists combination
      existingSong = await Song.findOne({
        title: songData.title,
        artists: { $all: songData.artists },
      });
    }

    let songIdToAdd;

    if (existingSong) {
      // Song exists, use its ID
      songIdToAdd = existingSong._id;
    } else {
      // Create new song
      const newSong = new Song({
        title: songData.title,
        artists: songData.artists,
        album: songData.album || "",
        duration: songData.duration || 0,
        cover: songData.cover || "",
        spotifyId: songData.spotifyId || "",
        spotifyUrl: songData.spotifyUrl || "",
      });

      const savedSong = await newSong.save();
      songIdToAdd = savedSong._id;
    }

    // Check if song is already in playlist
    if (playlist.songs.includes(songIdToAdd)) {
      return res.status(409).json({
        success: false,
        message: "Song is already in the playlist",
      });
    }

    // Add song to playlist
    playlist.songs.push(songIdToAdd);
    await playlist.save();

    // Populate for response
    await playlist.populate([
      { path: "userId", select: "username email" },
      { path: "songs", select: "title artists album" },
    ]);

    res.status(200).json({
      success: true,
      message: "Song added to playlist successfully",
      data: playlist,
    });
  } catch (error) {
    console.error("Add song to playlist error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Remove song from playlist
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { id: playlistId, songId } = req.params;
    const userId = req.user.userId;

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: "Song ID is required",
      });
    }

    // Find playlist and ensure user owns it
    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: userId,
    });
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Check if song exists in playlist
    const songIndex = playlist.songs.findIndex(
      (song) => song.toString() === songId
    );

    if (songIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Song not found in playlist",
      });
    }

    // Remove song from playlist
    playlist.songs.splice(songIndex, 1);
    await playlist.save();

    // Populate for response
    await playlist.populate([
      { path: "userId", select: "username email" },
      { path: "songs", select: "title artists album" },
    ]);

    res.status(200).json({
      success: true,
      message: "Song removed from playlist successfully",
      data: playlist,
    });
  } catch (error) {
    console.error("Remove song from playlist error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID or song ID",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
