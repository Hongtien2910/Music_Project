import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true }, // Clerk user ID
    receiverId: { type: String, required: true }, // Clerk user ID

    type: {
      type: String,
      enum: ["text", "song"],
      default: "text",
    },

    content: { type: String }, // Nội dung văn bản

    // Nếu là bài hát
    song: {
      songId: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
      title: String,
      artist: String,
      thumbnailUrl: String,
      audioUrl: String,
    },

	// song: [
	// 	{
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: "Song",
	// 	},
	// ],
    // Có thể mở rộng thêm các loại file khác nếu cần

  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
