
export const getMyProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      bio: req.user.bio,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};

export const updateMyProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name must contain between 2 and 50 characters.",
        });
      }
      req.user.name = name.trim();
    }

    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.length > 300) {
        return res.status(400).json({
          success: false,
          message: "Bio must be 300 characters or fewer.",
        });
      }
      req.user.bio = bio.trim();
    }

    if (avatar !== undefined) {
      if (typeof avatar !== "string" || avatar.length > 2048) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid avatar URL.",
        });
      }

      if (avatar.trim()) {
        try {
          const parsed = new URL(avatar.trim());
          if (!["http:", "https:"].includes(parsed.protocol)) {
            throw new Error("Invalid protocol");
          }
        } catch {
          return res.status(400).json({
            success: false,
            message: "Avatar must be a valid HTTP or HTTPS image URL.",
          });
        }
      }

      req.user.avatar = avatar.trim();
    }

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        bio: req.user.bio,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};
