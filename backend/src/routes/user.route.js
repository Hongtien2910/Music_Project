import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, getLikedSongs, getMessages} from "../controllers/user.controller.js";
import { get } from "mongoose";

const router = Router();

router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);
router.get('/:userId/likedSongs', protectRoute, getLikedSongs);

export default router;