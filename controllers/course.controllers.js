const Course = require("../models/course.model");
const Category = require("../models/category.model");
exports.getAllCourses = async(req, res) => {
    try {
        //truy vấn cơ sở dữ liệu
        const courses = await Course.find()
            .populate("teacherId","fullName email")//chỉ lấy name và email
            .populate("categoryId","name")//chî lấy name
            .sort({createdAt: -1});
        //trả về client
        res.status(200).json({
            courses
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getCourseDetails = async(req, res) => {
    try {
        const {courseId} = req.params;
        const course = await Course.findById(courseId)
            .populate("teacherId","fullName email")
            .populate("categoryId","name");

        if(!course){
            return res.status(404).json({message: "Course not found"});
        }
        res.status(200).json({
            _id: course._id,
            title: course.title,
            description: course.description,
            image: course.image,
            teacher: course.teacherId?.fullName||"Unknown",
            category: course.categoryId?.name|| "Uncategorized",
            price: course.price,
            shortIntro: course.shortIntroVideo,

        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};