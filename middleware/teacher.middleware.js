// middleware/teacher.middleware.js
const Role = require("../models/role.model");

exports.isTeacher = async (req, res, next) => {
  try {
    // Get user role
    const role = await Role.findById(req.user.role);

    if (!role) {
      return res.status(403).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check if role is teacher
    if (role.name !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Not authorized. This route is only accessible to teachers.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
