const mongoose = require("mongoose");
const roleModel = require("../models/role.model");
const userModel = require("../models/user.model");


// exports.getAllUsers = async (req, res) => {
//     try {
//         const { page = 1, limit = 10 } = req.query;
//         const pageNum = parseInt(page);
//         const limitNum = parseInt(limit);

//         // Lấy vai trò teacher và student
//         const teacherRole = await roleModel.findOne({ name: "TEACHER" });
//         const studentRole = await roleModel.findOne({ name: "STUDENT" });
//         if (!teacherRole || !studentRole) {
//             return res.status(500).json({ message: "Roles not found" });
//         }

//         // Lấy danh sách giảng viên
//         const teachers = await userModel.find({ role: teacherRole._id })
//             .select("email fullName role status isBanned createdAt")
//             .populate("role", "name")
//             .skip((pageNum - 1) * limitNum)
//             .limit(limitNum)
//             .lean();

//         const totalTeachers = await userModel.countDocuments({ role: teacherRole._id });

//         // Lấy danh sách học viên
//         const students = await userModel.find({ role: studentRole._id })
//             .select("email fullName role status isBanned createdAt")
//             .populate("role", "name")
//             .skip((pageNum - 1) * limitNum)
//             .limit(limitNum)
//             .lean();

//         const totalStudents = await userModel.countDocuments({ role: studentRole._id });

//         res.status(200).json({
//             teachers: {
//                 users: teachers,
//                 total: totalTeachers,
//                 page: pageNum,
//                 pages: Math.ceil(totalTeachers / limitNum),
//             },
//             students: {
//                 users: students,
//                 total: totalStudents,
//                 page: pageNum,
//                 pages: Math.ceil(totalStudents / limitNum),
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// controllers/userController.js
exports.getTeachers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
    
        // Lấy vai trò teacher
        const teacherRole = await Role.findOne({ name: "teacher" });
        if (!teacherRole) {
          return res.status(500).json({ message: "Teacher role not found" });
        }
    
        // Lấy danh sách giảng viên
        const teachers = await User.find({ role: teacherRole._id })
          .select("email fullName role status isBanned createdAt")
          .populate("role", "name")
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .lean();
    
        // Tính tổng số khóa học cho mỗi giảng viên
        for (let teacher of teachers) {
          teacher.totalCourses = await Course.countDocuments({ instructorId: teacher._id, status: "APPROVED" });
        }
    
        const totalTeachers = await User.countDocuments({ role: teacherRole._id });
    
        res.status(200).json({
          users: teachers,
          total: totalTeachers,
          page: pageNum,
          pages: Math.ceil(totalTeachers / limitNum),
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};


exports.getStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const studentRole = await roleModel.findOne({ name: "STUDENT" });
        if (!studentRole) {
            return res.status(500).json({ message: "Student role not found" });
        }

        const students = await userModel.find({ role: studentRole._id })
            .select("email fullName status isBanned createdAt -_id")
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();

        const totalStudents = await userModel.countDocuments({ role: studentRole._id });

        res.status(200).json({
            users: students,
            total: totalStudents,
            page: pageNum,
            pages: Math.ceil(totalStudents / limitNum),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
