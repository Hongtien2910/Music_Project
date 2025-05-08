import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
    try {
        const { id, firstName, lastName, imageUrl} = req.body;
    
        // check if user already exists
        const user = await User.findOne({ clerkId: id });
        if (!user) {
          //sign up
          await User.create({
            fullName: `${firstName} ${lastName}`,
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

      // Kiểm tra người dùng đã đăng ký trong hệ thống chưa
      const user = await User.findOne({ clerkId: req.auth.userId });
      
      if (!user) {
          return res.status(404).json({ authenticated: false, message: 'User not found' });
      }

      // Người dùng đã đăng nhập và tồn tại trong hệ thống
      return res.json({ authenticated: true });
  } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
      return res.status(500).json({ authenticated: false, message: "Internal Server Error" });
  }
};