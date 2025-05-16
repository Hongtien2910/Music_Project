import { Router } from "express";
import { getAllSongs, getFeaturedSongs, getMadeForYouSongs, getRecommendedSongs, getSongById, getTrendingSongs, incrementPlays, recognizeSongFromAudio } from "../controllers/song.controller.js";
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
router.post("/recoginize", recognizeSongFromAudio);
router.patch('/:songId/increment-plays', incrementPlays);

export default router;