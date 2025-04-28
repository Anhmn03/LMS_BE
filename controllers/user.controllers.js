const mongoose = require("mongoose");
const roleModel = require("../models/role.model");
const userModel = require("../models/user.model");
const courseModel = require("../models/course.model");

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
    const teacherRole = await Role.findOne({ name: "Teacher" });
    if (!teacherRole) {
      return res.status(500).json({ message: "Teacher role not found" });
    }

    // Lấy danh sách giảng viên
    const teachers = await userModel.find({ role: teacherRole._id })
      .select("email fullName role status isBanned createdAt")
      .populate("role", "name")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Tính tổng số khóa học cho mỗi giảng viên
    for (let teacher of teachers) {
      teacher.totalCourses = await courseModel.countDocuments({
        instructorId: teacher._id,
        status: "APPROVED",
      });
    }

    const totalTeachers = await userModel.countDocuments({ role: teacherRole._id });

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

    const studentRole = await roleModel.findOne({ name: "Student" });
    if (!studentRole) {
      return res.status(500).json({ message: "Student role not found" });
    }

    const students = await userModel
      .find({ role: studentRole._id })
      .select("email fullName status isBanned createdAt -_id")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const totalStudents = await userModel.countDocuments({
      role: studentRole._id,
    });

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
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (!allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      throw new Error(
        "This route is not for password updates. Please use /updateMyPassword."
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, "email");

    // 3) Update user document
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Find user by ID
        const user = await userModel
            .findById(id)
            .select("email fullName role status isBanned createdAt updatedAt")
            .populate("role", "name")
            .lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Initialize response object
        const userDetails = { ...user };

        // Get roles
        const teacherRole = await roleModel.findOne({ name: "TEACHER" });
        const studentRole = await roleModel.findOne({ name: "STUDENT" });

        if (!teacherRole || !studentRole) {
            return res.status(500).json({ message: "Roles not found" });
        }

        if (user.role._id.equals(teacherRole._id)) {
            // DEBUG: In ra ID giáo viên
            console.log("🧑‍🏫 Teacher ID:", user._id);
        
            // Lấy tất cả khóa học của giáo viên này (KHÔNG lọc status)
            const allCourses = await courseModel.find({ teacherId: user._id.toString() })

            .select("title status description price createdAt")
                .lean();
        
            console.log("📚 All courses (by teacher):", allCourses.length);
            allCourses.forEach((course, index) => {
                console.log(`📘 Course ${index + 1}:`, {
                    courseId: course._id,
                    title: course.title,
                    status: course.status,
                });
            });
        
            // Lọc các khóa học đã được APPROVED
            const approvedCourses = allCourses.filter(course => course.status === "APPROVED");
        
            console.log("✅ Approved courses count:", approvedCourses.length);
        
            // Truy vấn lesson cho mỗi course
            userDetails.courses = await Promise.all(
                approvedCourses.map(async (course) => {
                    const lessons = await lessonModel
                        .find({ courseId: course._id })
                        .select("title contentType createdAt")
                        .sort({ createdAt: 1 })
                        .lean();
        
                    return {
                        courseId: course._id,
                        courseTitle: course.title,
                        description: course.description,
                        price: course.price,
                        createdAt: course.createdAt,
                        lessons: lessons.map(lesson => ({
                            lessonId: lesson._id,
                            lessonTitle: lesson.title,
                            contentType: lesson.contentType,
                            createdAt: lesson.createdAt
                        }))
                    };
                })
            );
        
            userDetails.totalCourses = approvedCourses.length;
        }
         else if (user.role._id.equals(studentRole._id)) {
            // For students, include enrolled courses, completed lessons, and current lesson
            const enrollments = await enrollmentModel
                .find({ studentId: user._id })
                .select("courseId enrollmentDate completedLessons progress")
                .populate("courseId", "title")
                .lean();

            userDetails.enrolledCourses = enrollments.map(enrollment => ({
                courseId: enrollment.courseId._id,
                courseTitle: enrollment.courseId.title,
                enrolledAt: enrollment.enrollmentDate,
                progress: enrollment.progress
            }));
            userDetails.totalEnrolledCourses = enrollments.length;

            // Build completed lessons
            const completedLessons = [];
            for (const enrollment of enrollments) {
                for (const completedLesson of enrollment.completedLessons) {
                    const lesson = await lessonModel
                        .findById(completedLesson.lessonId)
                        .select("title contentType createdAt")
                        .lean();
                    if (lesson) {
                        completedLessons.push({
                            courseId: enrollment.courseId._id,
                            courseTitle: enrollment.courseId.title,
                            lessonId: completedLesson.lessonId,
                            lessonTitle: lesson.title,
                            contentType: lesson.contentType,
                            completedAt: completedLesson.completedAt
                        });
                    }
                }
            }
            userDetails.completedLessons = completedLessons;
            userDetails.totalCompletedLessons = completedLessons.length;

            // Find current lesson (first uncompleted lesson in any enrolled course)
            let currentLesson = null;
            for (const enrollment of enrollments) {
                const courseLessons = await lessonModel
                    .find({ courseId: enrollment.courseId._id })
                    .select("title contentType createdAt")
                    .sort({ createdAt: 1 })
                    .lean();

                const completedLessonIds = enrollment.completedLessons.map(l => l.lessonId.toString());
                const nextLesson = courseLessons.find(lesson => !completedLessonIds.includes(lesson._id.toString()));

                if (nextLesson && !currentLesson) {
                    currentLesson = {
                        courseId: enrollment.courseId._id,
                        courseTitle: enrollment.courseId.title,
                        lessonId: nextLesson._id,
                        lessonTitle: nextLesson.title,
                        contentType: nextLesson.contentType,
                        startedAt: enrollment.enrollmentDate // Proxy for start time
                    };
                }
            }
            if (currentLesson) {
                userDetails.currentLesson = currentLesson;
            }
        } else {
            return res.status(400).json({ message: "Invalid user role" });
        }

        res.status(200).json({
            user: userDetails
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to generate a random secure password
const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

exports.createTeacher = async (req, res) => {
    try {
        const { email, fullName } = req.body;

        // Validate required fields
        if (!email || !fullName) {
            return res.status(400).json({ message: "Email and full name are required" });
        }

        // Check if email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Find the TEACHER role
        const teacherRole = await roleModel.findOne({ name: "TEACHER" });
        if (!teacherRole) {
            return res.status(500).json({ message: "Teacher role not found" });
        }

        // Generate random password
        const generatedPassword = generateRandomPassword();

        // Hash the generated password
        const hashedPassword = await bcryptjs.hash(generatedPassword, 10);

        // Create new teacher
        const newTeacher = new userModel({
            email,
            fullName,
            password: hashedPassword,
            role: teacherRole._id,
            status: "ACTIVE",
            isBanned: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Save the teacher to the database
        await newTeacher.save();

        // Send email with account details
        await sendTeacherCredentials({ email, fullName, password: generatedPassword });

        // Populate role for response
        const teacherResponse = await userModel.findById(newTeacher._id)
            .select("email fullName password role status isBanned createdAt updatedAt")
            .populate("role", "name")
            .lean();

        res.status(201).json({
            message: "Teacher created successfully and account details emailed",
            user: teacherResponse
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Find user by ID
        const user = await userModel.findById(id).select("email fullName role status isBanned createdAt updatedAt");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Toggle user status and update isBanned
        if (user.status === "ACTIVE") {
            user.status = "INACTIVE";
            user.isBanned = true;
        } else {
            user.status = "ACTIVE";
            user.isBanned = false;
        }
        user.updatedAt = new Date();
        await user.save();

        // Populate role for response
        const userResponse = await userModel.findById(id)
            .select("email fullName role status isBanned createdAt updatedAt")
            .populate("role", "name")
            .lean();

        res.status(200).json({
            message: `User status updated to ${userResponse.status} successfully`,
            user: userResponse
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//search 
exports.searchTeachers = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Find TEACHER role
        const teacherRole = await roleModel.findOne({ name: "Teacher" });
        if (!teacherRole) {
            return res.status(500).json({ message: "Teacher role not found" });
        }

        // Build query object
        const query = { role: teacherRole._id };
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // Fetch teachers with pagination
        const teachers = await userModel
            .find(query)
            .select("email fullName role status isBanned createdAt")
            .populate("role", "name")
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();

        // Add totalCourses for each teacher
        for (let teacher of teachers) {
            teacher.totalCourses = await courseModel.countDocuments({ instructorId: teacher._id, status: "APPROVED" });
        }

        // Get total count for pagination
        const totalTeachers = await userModel.countDocuments(query);

        res.status(200).json({
            users: teachers,
            total: totalTeachers,
            page: pageNum,
            pages: Math.ceil(totalTeachers / limitNum)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search Students
exports.searchStudents = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Find STUDENT role
        const studentRole = await roleModel.findOne({ name: "Student" });
        if (!studentRole) {
            return res.status(500).json({ message: "Student role not found" });
        }

        // Build query object
        const query = { role: studentRole._id };
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // Fetch students with pagination
        const students = await userModel
            .find(query)
            .select("email fullName role status isBanned createdAt")
            .populate("role", "name")
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();

        // Get total count for pagination
        const totalStudents = await userModel.countDocuments(query);

        res.status(200).json({
            users: students,
            total: totalStudents,
            page: pageNum,
            pages: Math.ceil(totalStudents / limitNum)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, specialization, expertise, profilePicture } = req.body;

        // Validate teacher ID
        if (!id || !mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid teacher ID" });
        }
        // Find teacher role
        const teacherRole = await roleModel.findOne({ name: "Teacher" });
        if (!teacherRole) {
            return res.status(500).json({ message: "Teacher role not found" });
        }

        // Find teacher with role verification
        const teacher = await userModel.findOne({
            _id: id,
            role: teacherRole._id,
            isBanned: false,
            status: "ACTIVE"
        });

        if (!teacher) {
            return res.status(404).json({ 
                message: "Teacher not found or account is inactive/banned" 
            });
        }

        // Prepare update data with validation
        const updateData = {};
        if (fullName) {
            const trimmedName = fullName.trim();
            if (trimmedName.length < 2 || trimmedName.length > 50) {
                return res.status(400).json({ 
                    message: "Full name must be between 2 and 50 characters" 
                });
            }
            updateData.fullName = trimmedName;
        }

        if (specialization) {
            const trimmedSpec = specialization.trim();
            if (trimmedSpec.length > 100) {
                return res.status(400).json({ 
                    message: "Specialization cannot exceed 100 characters" 
                });
            }
            updateData.specialization = trimmedSpec;
        }

        if (expertise) {
            const trimmedExp = expertise.trim();
            if (trimmedExp.length > 100) {
                return res.status(400).json({ 
                    message: "Expertise cannot exceed 100 characters" 
                });
            }
            updateData.expertise = trimmedExp;
        }

        if (profilePicture) {
            const imageRegex = /\.(jpg|jpeg|png|gif)$/i;
            if (profilePicture.trim() && !imageRegex.test(profilePicture)) {
                return res.status(400).json({ 
                    message: "Profile picture must be a valid image URL" 
                });
            }
            updateData.profilePicture = profilePicture.trim();
        }

        // Only update if there are changes
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                message: "No valid fields provided for update" 
            });
        }

        updateData.updatedAt = new Date();

        // Update teacher
        const updatedTeacher = await userModel
            .findByIdAndUpdate(id, { $set: updateData }, {
                new: true,
                runValidators: true
            })
            .select("email fullName specialization expertise profilePicture role status createdAt updatedAt")
            .lean();

        res.status(200).json({
            message: "Teacher updated successfully",
            user: {
                ...updatedTeacher,
                role: updatedTeacher.role.name
            }
        });
    } catch (error) {
        console.error("Error updating teacher:", error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
};