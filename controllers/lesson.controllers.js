const Lesson = require("../models/lesson.model");
const Enrollment = require("../models/enrollment.model");
const Course = require("../models/course.model");

exports.GetLessonsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const lessons = await Lesson.find({ courseId }).sort({ createdAt: 1 });
        res.status(200).json({
            success : true,
            total: lessons.length,
            lessons
            });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

// Get lessons with different access levels for enrolled and non-enrolled users
exports.getAllLessonsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id; // Assuming user is authenticated
        // const userId ="661a20000000000000000003"; // For testing
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: "Course not found" 
            });
        }
        
        // Check if user is enrolled in the course
        const enrollment = await Enrollment.findOne({ 
            studentId: userId, 
            courseId: courseId 
        });
        
        // Get all lessons for this course
        const lessons = await Lesson.find({ courseId }).sort({ createdAt: 1 });
        
        if (enrollment) {
            // User is enrolled - provide full access to lesson details
            // Get completed lessons info for timestamps
            const completedLessonsMap = {};
            enrollment.completedLessons.forEach(lesson => {
                completedLessonsMap[lesson.lessonId.toString()] = lesson.completedAt;
            });
            
            // Map lessons with status and completion timestamp
            const lessonsWithStatus = lessons.map(lesson => ({
                _id: lesson._id,
                title: lesson.title,
                description: lesson.description,
                contentType: lesson.contentType,
                contentUrl: lesson.contentUrl,
                status: lesson.status,
                // isCompleted: lesson.status === "COMPLETE",
                completedAt: completedLessonsMap[lesson._id.toString()]
            }));
            
            // Count completed lessons
            const completedCount = lessons.filter(lesson => lesson.status === "COMPLETE").length;
            
            res.status(200).json({
                success: true,
                isEnrolled: true,
                progress: enrollment.progress,
                total: lessons.length,
                completedCount: completedCount,
                lessons: lessonsWithStatus
            });
        } else {
            // User is not enrolled - provide limited information
            const limitedLessons = lessons.map(lesson => ({
                _id: lesson._id,
                title: lesson.title,
                contentType: lesson.contentType
            }));
            
            res.status(200).json({
                success: true,
                isEnrolled: false,
                total: lessons.length,
                lessons: limitedLessons
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Update user progress for a lesson
exports.updateLessonProgress = async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;
        const userId = req.user._id; // Assuming user is authenticated
        // const userId ="661a20000000000000000003"; // For testing
        // Verify course and lesson exist
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: "Course not found" 
            });
        }
        
        const lesson = await Lesson.findOne({ 
            _id: lessonId,
            courseId: courseId
        });
        
        if (!lesson) {
            return res.status(404).json({ 
                success: false, 
                message: "Lesson not found or does not belong to this course" 
            });
        }
        
        // Find enrollment or create if doesn't exist
        let enrollment = await Enrollment.findOne({ 
            studentId: userId, 
            courseId: courseId 
        });
        
        if (!enrollment) {
            return res.status(400).json({ 
                success: false, 
                message: "You must be enrolled in this course to update progress" 
            });
        }
        
        // Check if lesson is already marked as completed
        const isAlreadyCompleted = enrollment.completedLessons.some(
            item => item.lessonId.toString() === lessonId
        );
        
        if (!isAlreadyCompleted) {
            // Add lesson to completed lessons
            enrollment.completedLessons.push({
                lessonId: lessonId,
                completedAt: new Date()
            });
            
            // Update the lesson's status to COMPLETE
            lesson.status = "COMPLETE";
            await lesson.save();
            
            // Save changes - the pre-save hook in enrollment model will update progress percentage
            await enrollment.save();
        }
        
        // Get total lessons for this course
        const totalLessons = await Lesson.countDocuments({ courseId });
        const completedCount = enrollment.completedLessons.length;
        
        res.status(200).json({
            success: true,
            message: "Progress updated successfully",
            isAlreadyCompleted,
            progress: enrollment.progress,
            completed: completedCount,
            total: totalLessons
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Get user progress for a course
exports.getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id; // Assuming user is authenticated
        
        // Find enrollment
        const enrollment = await Enrollment.findOne({ 
            studentId: userId, 
            courseId: courseId 
        });
        
        if (!enrollment) {
            return res.status(200).json({ 
                success: true,
                isEnrolled: false,
                message: "User is not enrolled in this course" 
            });
        }
        
        // Get all lessons for this course and count completed ones
        const lessons = await Lesson.find({ courseId });
        const totalLessons = lessons.length;
        const completedLessons = lessons.filter(lesson => lesson.status === "COMPLETE");
        const completedCount = completedLessons.length;
        
        // Calculate progress percentage
        const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        
        res.status(200).json({
            success: true,
            isEnrolled: true,
            progress: progress,
            completedCount: completedCount,
            totalLessons,
            completedLessons: completedLessons.map(lesson => ({
                lessonId: lesson._id,
                title: lesson.title,
                completedAt: enrollment.completedLessons.find(
                    item => item.lessonId.toString() === lesson._id.toString()
                )?.completedAt
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};