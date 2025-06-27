import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Playlist = new mongoose.model("Playlist", playlistSchema);
