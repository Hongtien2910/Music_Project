import {Song} from "../models/song.model.js";
import {Album} from "../models/album.model.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import os from 'os';
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

    // 1. Upload audio, image, lyric lên Cloudinary
    const audioUrl = await uploadToCloudinary(audioFile);
    const imageUrl = await uploadToCloudinary(imageFile);
    const lyricUrl = lyricFile ? await uploadToCloudinary(lyricFile) : null;

    // 2. Tạo file tạm từ audioFile trong thư mục tạm
    const os = await import("os");
    const tmpDir = os.tmpdir();
    const tmpPath = path.join(tmpDir, `${title}.mp3`);

    fs.copyFileSync(audioFile.tempFilePath, tmpPath);

    // 3. Gửi file tạm và tên bài hát đến Flask server gợi ý (port 5000)
    const form1 = new FormData();
    form1.append("file", fs.createReadStream(tmpPath), {
      filename: `${title}.mp3`,
      contentType: audioFile.mimetype,
    });
    form1.append("song_name", title);

    await axios.post("http://127.0.0.1:5000/create", form1, {
      headers: form1.getHeaders(),
    });

    // 4. Gửi file tạm và tên bài hát đến Flask server nhận diện (port 5001)
    const form2 = new FormData();
    form2.append("file", fs.createReadStream(tmpPath), {
      filename: `${title}.mp3`,
      contentType: audioFile.mimetype,
    });
    form2.append("song_name", title);

    await axios.post("http://127.0.0.1:5001/songs", form2, {
      headers: form2.getHeaders(),
    });

    // 5. Xóa file tạm
    fs.unlinkSync(tmpPath);

    // 6. Lưu bài hát vào MongoDB
    const song = new Song({
      title,
      artist,
      audioUrl,
      imageUrl,
      lyricUrl,
      duration,
      albumId,
    });

    await song.save();

    if (albumId) {
      await Album.findByIdAndUpdate(albumId, {
        $push: { songs: song._id },
      });
    }

    res.status(201).json(song);
  } catch (error) {
    console.error("Error in create Song", error);
    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
    try {
        const { id } = req.params;
        const song = await Song.findById(id);

        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        // Xóa khỏi album nếu có
        if (song.albumId) {
            await Album.findByIdAndUpdate(song.albumId, {
                $pull: { songs: song._id },
            });
        }

        // Xóa fingerprint bên Flask
        try {
            await axios.delete("http://127.0.0.1:5001/delete", {
                params: { song_name: song.title + ".mp3" },
            });
        } catch (flaskErr) {
            console.error("Failed to delete fingerprint in Flask:", flaskErr.response?.data || flaskErr.message);
        }

        // Xóa feature vector bên Flask recommend
        try {
            await axios.delete("http://127.0.0.1:5000/delete", {
                params: { song_name: song.title },
            });
        } catch (recommendErr) {
            console.error("Failed to delete recommend feature in Flask:", recommendErr.response?.data || recommendErr.message);
        }

        // Xóa trong MongoDB
        await Song.findByIdAndDelete(id);

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

export const updateSong = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, artist, albumId, duration } = req.body;

		const song = await Song.findById(id);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		// Nếu có file mới, upload và thay thế
		if (req.files) {
			if (req.files.audioFile) {
				const audioUrl = await uploadToCloudinary(req.files.audioFile);
				song.audioUrl = audioUrl;
			}
			if (req.files.imageFile) {
				const imageUrl = await uploadToCloudinary(req.files.imageFile);
				song.imageUrl = imageUrl;
			}
			if (req.files.lyricFile) {
				const lyricUrl = await uploadToCloudinary(req.files.lyricFile);
				song.lyricUrl = lyricUrl;
			}
		}

		// Cập nhật thông tin cơ bản
		song.title = title || song.title;
		song.artist = artist || song.artist;
		song.duration = duration || song.duration;

		// Nếu album thay đổi, cập nhật cả album cũ và mới
		if (albumId && albumId !== song.albumId?.toString()) {
			// Xoá khỏi album cũ
			if (song.albumId) {
				await Album.findByIdAndUpdate(song.albumId, {
					$pull: { songs: song._id },
				});
			}
			// Thêm vào album mới
			await Album.findByIdAndUpdate(albumId, {
				$push: { songs: song._id },
			});
			song.albumId = albumId;
		}

		await song.save();

		res.status(200).json(song);
	} catch (error) {
		console.log("Error in updateSong", error);
		next(error);
	}
};

export const updateAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, artist, releaseYear } = req.body;

		const album = await Album.findById(id);
		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		// Nếu có file mới, upload và thay thế ảnh album
		if (req.files && req.files.imageFile) {
			const imageUrl = await uploadToCloudinary(req.files.imageFile);
			album.imageUrl = imageUrl;
		}

		// Cập nhật các trường thông tin
		album.title = title || album.title;
		album.artist = artist || album.artist;
		album.releaseYear = releaseYear || album.releaseYear;

		await album.save();

		res.status(200).json(album);
	} catch (error) {
		console.log("Error in updateAlbum", error);
		next(error);
	}
};
