import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

export const getAllUsers = async (req, res, next) => {
    try {
        const currentUser = req.auth.userId;
        const users = await User.find({clerkId: { $ne: currentUser }});
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
	try {
		const myId = req.auth.userId;
		const { userId } = req.params;

		const messages = await Message.find({
			$or: [
				{ senderId: userId, receiverId: myId },
				{ senderId: myId, receiverId: userId },
			],
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		next(error);
	}
};

export const getLikedSongs = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("likedSongs");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.likedSongs);
  } catch (error) {
    console.error("Error in getLikedSongs:", error);
    next(error);
  }
};