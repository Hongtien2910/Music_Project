import { Song } from "../models/song.model.js";

export const getAllSongs = async (req, res, next) => {
    try {
        // -1 means descending order, 1 means ascending order
        const songs = await Song.find().sort({createAt: -1});
        res.status(200).json(songs);
    } catch (error) {
        console.log("Error in getAllSongs", error);
        next(error);
    }
};

export const getFeaturedSongs = async (req, res, next) => {
    // 6 random songs use mongodb aggregate pipeline
    try {
        const songs = await Song.aggregate([
            {
                $sample:{size:6}
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                    lyricUrl: 1,
                }
            }
        ])
        res.status(200).json(songs);
    } catch (error) {
        console.log("Error in getFeaturedSongs", error);
        next(error);
    }
};

export const getMadeForYouSongs = async (req, res, next) => {
    try {
        const songs = await Song.aggregate([
            {
                $sample:{size:4}
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                    lyricUrl: 1,
                }
            }
        ])
        res.status(200).json(songs);
    } catch (error) {
        console.log("Error in getMadeForYouSongs", error);
        next(error);
    }
};

export const getTrendingSongs = async (req, res, next) => {
    try {
        const songs = await Song.aggregate([
            {
                $sample:{size:4}
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                    lyricUrl: 1,
                }
            }
        ])
        res.status(200).json(songs);
    } catch (error) {
        console.log("Error in getTrendingSongs", error);
        next(error);
    }
};

export const getSongById = async (req, res, next) => {
    try {
        const { songId } = req.params;
        const song = await Song.findById(songId).populate("albumId", "title");
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }
        res.status(200).json(song);
    } catch (error) {
        console.log("Error in getSongById", error);
        next(error);
    }
};