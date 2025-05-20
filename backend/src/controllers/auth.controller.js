import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
    try {
        const { id, firstName, lastName, imageUrl} = req.body;
    
        // check if user already exists
        const user = await User.findOne({ clerkId: id });
        if (!user) {
          //sign up
          await User.create({
            fullName: `${firstName || ""}  ${lastName || ""}`.trim(),
            imageUrl: imageUrl,
            clerkId: id,
          });
        }
        res.status(200).json({success: true});
    } catch (error) {
        console.error("Error in callback:", error);
        next(error);
      }
};

export const checkAuthStatus = async (req, res) => {
  try {
    if (!req.auth.userId) {
      return res.status(401).json({ authenticated: false }); // Người dùng chưa đăng nhập
    }

    // Lấy user từ DB
    const user = await User.findOne({ clerkId: req.auth.userId }).select("-password -__v");

    if (!user) {
      return res.status(404).json({ authenticated: false, message: 'User not found' });
    }

    // Trả về authenticated và thông tin user
    return res.json({
      authenticated: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        clerkId: user.clerkId,
        // thêm các trường khác nếu cần
      }
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
    return res.status(500).json({ authenticated: false, message: "Internal Server Error" });
  }
};