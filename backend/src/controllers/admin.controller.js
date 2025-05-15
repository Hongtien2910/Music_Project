import {Song} from "../models/song.model.js";
import {Album} from "../models/album.model.js";

import cloudinary from "../lib/cloudinary.js";
const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            resource_type: "auto",
        });
        return result.secure_url;
    } catch (error) {
        console.error("Error uploading to Cloudinary", error);
        throw new Error("Cloudinary upload failed");
    }
};


export const createSong = async (req, res, next) => {
    try {
        if (!req.files || !req.files.audioFile || !req.files.imageFile) {  
            return res.status(400).json({ message: "Please upload all files" });
        }

        const { title, artist, albumId, duration } = req.body;
        const audioFile = req.files.audioFile;
        const imageFile = req.files.imageFile;
        const lyricFile = req.files.lyricFile;

        const audioUrl = await uploadToCloudinary(audioFile);
        const imageUrl = await uploadToCloudinary(imageFile);   
        const lyricUrl = await uploadToCloudinary(lyricFile);

        const song = new Song({
            title,
            artist,
            audioUrl,
            imageUrl,
            lyricUrl,
            duration,
            albumId
        })

        await song.save();

        // if song belong to album, update album song array
        if (albumId){
            await Album.findByIdAndUpdate(albumId, {
                $push: { songs: song._id},
            });
        }
        res.status(201).json(song)
    } catch (error) {
        console.log("Error in create Song", error);
        next(error);
    }
};

export const deleteSong = async (req, res, next) => {
    try {
        const { id } = req.params;
        const song = await Song.findById(id);

        if (song.albumId) {
            await Album.findByIdAndUpdate(song.albumId, {
                $pull: { songs: song._id },
            });
        }
        await Song.findByIdAndDelete(id);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }
        res.status(200).json({ message: "Song deleted successfully" });
    } catch (error) {
        console.log("Error in delete Song", error);
        next(error);
    }
};

export const createAlbum = async (req, res, next) => {
    try {
        if (!req.files || !req.files.imageFile) {  
            return res.status(400).json({ message: "Please upload all files" });
        }

        const { title, artist, releaseYear } = req.body;
        const imageFile = req.files.imageFile;

        const imageUrl = await uploadToCloudinary(imageFile);   

        const album = new Album({
            title,
            artist,
            imageUrl,
            releaseYear
        })

        await album.save();

        res.status(201).json(album)
    } catch (error) {
        console.log("Error in create Album", error);
        next(error);
    }
};

export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		await Song.deleteMany({ albumId: id });
		await Album.findByIdAndDelete(id);
		res.status(200).json({ message: "Album deleted successfully" });
	} catch (error) {
		console.log("Error in deleteAlbum", error);
		next(error);
	}
};

export const checkAdmin = async (req, res, next) => {
    res.status(200).json({ admin: true });
};