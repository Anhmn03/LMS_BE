const Enrollment = require("../models/enrollment.model");
const Course = require("../models/course.model");
const Payment = require("../models/payment.model");

exports.enrollAfterPayment = async (req, res) => {
    const { courseId } = req.body;
    const studentId = req.user._id; // Lấy ID từ JWT token
    
    try {
        // Kiểm tra xem có thanh toán thành công không
        const payment = await Payment.findOne({
            studentId,
            courseId,
            status: "COMPLETED" 
        });
        
        if (!payment) {
            return res.status(400).json({ 
                success: false,
                message: "Payment not completed for this course" 
            });
        }
        
        // Kiểm tra xem đã đăng ký khóa học chưa
        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (existingEnrollment) {
            return res.status(400).json({ 
                success: false,
                message: "You are already enrolled in this course" 
            });
        }
        
        // Tạo bản ghi đăng ký mới
        const enrollment = await Enrollment.create({ 
            studentId, 
            courseId,
            enrollmentDate: new Date()
        });
        
        res.status(200).json({ 
            success: true,
            message: "Enrollment successful",
            enrollment
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: "Enrollment failed", 
            error: error.message 
        });
    }
};

// Lấy danh sách khóa học đã đăng ký
exports.getEnrolledCourses = async (req, res) => {
    try {
        const studentId = req.user._id;
       
        const enrollments = await Enrollment.find({ studentId })
            .populate({
                path: 'courseId',
                select: 'title description image price teacherId categoryId'
            })
            .sort({ enrollmentDate: -1 });
        
        // Tính toán tiến độ cho mỗi khóa học
        const enrolledCourses = enrollments.map(enrollment => ({
            _id: enrollment.courseId._id,
            title: enrollment.courseId.title,
            description: enrollment.courseId.description,
            image: enrollment.courseId.image,
            progress: enrollment.progress,
            enrollmentDate: enrollment.enrollmentDate,
            completedLessons: enrollment.completedLessons.length
        }));
        
        res.status(200).json({
            success: true,
            count: enrolledCourses.length,
            enrolledCourses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching enrolled courses",
            error: error.message
        });
    }
};