import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: String,
    artists: [String],
    album: String,
    duration: Number,
    cover: String,
    spotifyId: String,
    spotifyUrl: String,
  },
  {
    timestamps: true,
  }
);

export const Song = new mongoose.model("Song", songSchema);
