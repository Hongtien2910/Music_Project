import { Router } from "express";
import { getAlbumById, getAllAlbums, getRandomAlbums } from "../controllers/album.controller.js";

const router = Router();

router.get("/", getAllAlbums);
router.get("/randomAlbum", getRandomAlbums);
router.get("/:albumId", getAlbumById);


export default router;