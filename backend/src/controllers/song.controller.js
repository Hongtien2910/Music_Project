import { Song } from "../models/song.model.js";
import axios from "axios";

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

export const getRecommendedSongs = async (req, res, next) => {
  try {
    
    const { songName } = req.body;

    if (!songName) {
      return res.status(400).json({ message: "Thiếu tên bài hát" });
    }

    // Gọi API Python
    const response = await axios.post("http://127.0.0.1:5000/recommend", {
      song_name: songName
    });

    const recommendedSongs = response.data;

    // Tìm các bài hát trong MongoDB
    const mongoSongs = await Song.find({
      title: { $in: recommendedSongs.map(song => song.name) }
    });

    // Kết hợp dữ liệu
    const result = recommendedSongs.map(song => {
      const mongoSong = mongoSongs.find(m => m.title === song.name);
      return {
        ...song,
        mongoData: mongoSong ? {
          _id: mongoSong._id,
          title: mongoSong.title,
          artist: mongoSong.artist,
          imageUrl: mongoSong.imageUrl,
          audioUrl: mongoSong.audioUrl,
          lyricUrl: mongoSong.lyricUrl,
          plays: mongoSong.plays,
          duration: mongoSong.duration
        } : null
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.log("Error in getRecommendedSongs", error);
    next(error);
  }
};


export const getTrendingSongs = async (req, res, next) => {
    try {
        const songs = await Song.aggregate([
            { $sort: { plays: -1 } },
            { $limit: 4 }, 
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                    lyricUrl: 1,
                    plays: 1,
                }
            }
        ]);

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

export const incrementPlays = async (req, res, next) => {
  try {
    const songId = req.params.id;

    const song = await Song.findById(songId);
    if (!song) return res.status(404).json({ message: 'Bài hát không tồn tại' });

    song.plays = (song.plays || 0) + 1;
    await song.save();

    res.status(200).json({ plays: song.plays });
  } catch (error) {
    console.error('Lỗi khi tăng lượt nghe:', error);
    next(error);
  }
};