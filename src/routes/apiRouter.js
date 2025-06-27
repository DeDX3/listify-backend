import express from "express";
import authRouter from "./authRouter.js";
import playlistRouter from "./playlistRouter.js";

const router = express.Router();

// Auth routes
router.use("/auth", authRouter);

// Playlist routes
router.use("/playlists", playlistRouter);

export default router;
