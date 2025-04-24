const Cart = require("../models/cart.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");

exports.addToCart = async (req, res) => {
    try {
        // Get courseId from request and studentId from authenticated user
        const { courseId } = req.body;
        //const studentId = req.user._id;
        const studentId = "661a20000000000000000003"; // For testing
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ 
                success: false,
                message: "Course not found" 
            });
        }
        
        // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in this course"
            });
        }
        
        // Kiểm tra xem khóa học đã có trong giỏ hàng chưa
        const existingItem = await Cart.findOne({studentId, courseId});
        if (existingItem) {
            return res.status(400).json({ 
                success: false,
                message: "Course already in cart" 
            });
        }
        
        const cartItem = new Cart({ studentId, courseId });
        await cartItem.save();

        res.status(201).json({ 
            success: true,
            message: "Course added to cart successfully", 
            cartItem 
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: error.message 
        });
    }
};

exports.getCart = async (req, res) => {
    try {
        // Get studentId from authenticated user
        // const studentId = req.user._id;
        const studentId = "661a20000000000000000003"; // For testing

        const cartItems = await  
Cart.find({ studentId })

        
            .populate("courseId");

        res.status(200).json({ 
            success: true,
            cartItems 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: error.message 
        });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        // Get courseId from params and studentId from authenticated user
        const { courseId } = req.params;
        // const studentId = req.user._id;
        const studentId = "661a20000000000000000003"; // For testing
        
        const result = await Cart.findOneAndDelete({ studentId, courseId });
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Course removed from cart successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Server error",
            error: error.message 
        });
    }
};

