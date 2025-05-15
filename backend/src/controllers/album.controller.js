import { Album } from "../models/album.model.js";

export const getAllAlbums = async (req, res, next) => {
    try {
        const albums = await Album.find();
        res.status(200).json(albums);
    } catch (error) {
        console.log("Error in getAllAlbums", error);
        next(error);
    }
};

export const getAlbumById = async (req, res, next) => {
    try {
        const { albumId } = req.params;
        const album = await Album.findById(albumId).populate("songs");
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }
        res.status(200).json(album);
    } catch (error) {
        console.log("Error in getAlbumById", error);
        next(error);
    }
};

export const getRandomAlbums = async (req, res, next) => {
    try {
        const albums = await Album.aggregate([
            {
                $sample:{size:4}
            },
            {
                $lookup: {
                from: "songs", 
                localField: "songs",
                foreignField: "_id",  
                as: "songsInfo",     
                }
            },

            {
                $project: {
                _id: 1,
                title: 1,
                artist: 1,
                imageUrl: 1,
                releaseYear: 1,
                songs: "$songsInfo",  
                }
            }
        ])
        res.status(200).json(albums);
    } catch (error) {
        console.log("Error in getRandomAlbum", error);
        next(error);
    }
};