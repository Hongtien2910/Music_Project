import mongoose from "mongoose";

const songSchema = new mongoose.Schema( {   
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    audioUrl: {
        type: String,
        required: true,
    },
    lyricUrl: {
        type: String,
        required: false,
    },
    duration: {
        type: String,
        required: true,
    },
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
        required: false,
    },
}, {    
    timestamps: true,
});

export const Song = mongoose.model("Song", songSchema);