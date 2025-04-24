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
    duration: {
        type: String,
        required: true,
    },
    albumID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
        required: true,
    },
}, {    
    timestamps: true,
});

export const Song = mongoose.model("Song", songSchema);