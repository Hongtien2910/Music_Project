import { Router } from "express";
import { getAllSongs, getFeaturedSongs, getMadeForYouSongs, getRecommendedSongs, getSongById, getTrendingSongs, incrementPlays, likeSong, recognizeSongFromAudio, unlikeSong } from "../controllers/song.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { get } from "mongoose";

const router = Router();

// router.get("/", protectRoute, requireAdmin, getAllSongs);
router.get("/", getAllSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs);
router.get("/:songId", getSongById);
router.post("/recommend", getRecommendedSongs);
router.post("/recognize", recognizeSongFromAudio);
router.patch('/:songId/incrementplays', incrementPlays);
router.post('/:songId/like', likeSong);
router.post('/:songId/unlike', unlikeSong);

export default router;