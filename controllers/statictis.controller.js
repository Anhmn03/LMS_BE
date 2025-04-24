const mongoose = require('mongoose');
const paymentModel = require('../models/payment.model');
const enrollmentModel = require('../models/enrollment.model');
const userModel = require('../models/user.model');

// Get revenue statistics for all courses
exports.getCourseRevenueStats = async (req, res) => {
    try {
        const { page = 1, limit = 10, month, year } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = { status: 'COMPLETED' };
        if (month && year) {
            const startDate = new Date(year, parseInt(month) - 1, 1);
            const endDate = new Date(year, parseInt(month), 0);
            query.paymentDate = { $gte: startDate, $lte: endDate };
        } else if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            query.paymentDate = { $gte: startDate, $lte: endDate };
        }

        const payments = await paymentModel.find(query)
            .populate({
                path: 'courseId',
                select: 'title teacherId',
                populate: { path: 'teacherId', select: 'fullName' }
            })
            .select('amount courseId')
            .lean();

        const stats = payments.reduce((acc, payment) => {
            const courseId = payment.courseId._id.toString();
            const existing = acc.find(s => s.courseId === courseId);

            if (existing) {
                existing.totalRevenue += payment.amount;
                existing.paymentCount += 1;
            } else {
                acc.push({
                    courseId,
                    courseTitle: payment.courseId.title,
                    teacherName: payment.courseId.teacherId.fullName,
                    totalRevenue: payment.amount,
                    paymentCount: 1
                });
            }

            return acc;
        }, []);

        // Apply pagination
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedStats = stats.slice(startIndex, startIndex + limitNum);

        res.status(200).json({
            stats: paginatedStats,
            total: stats.length,
            page: pageNum,
            pages: Math.ceil(stats.length / limitNum)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get most enrolled courses
exports.getMostEnrolledCourses = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const enrollments = await enrollmentModel.find()
            .populate({
                path: 'courseId',
                select: 'title teacherId',
                populate: { path: 'teacherId', select: 'fullName' }
            })
            .select('courseId')
            .lean();

        const stats = enrollments.reduce((acc, enrollment) => {
            const courseId = enrollment.courseId._id.toString();
            const existing = acc.find(s => s.courseId === courseId);

            if (existing) {
                existing.enrollmentCount += 1;
            } else {
                acc.push({
                    courseId,
                    courseTitle: enrollment.courseId.title,
                    teacherName: enrollment.courseId.teacherId.fullName,
                    enrollmentCount: 1
                });
            }

            return acc;
        }, []).sort((a, b) => b.enrollmentCount - a.enrollmentCount);

        // Apply pagination
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedStats = stats.slice(startIndex, startIndex + limitNum);

        res.status(200).json({
            stats: paginatedStats,
            total: stats.length,
            page: pageNum,
            pages: Math.ceil(stats.length / limitNum)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user statistics (students and teachers)
exports.getUserStats = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const studentRole = await mongoose.model('Role').findOne({ name: 'student' }).select('_id').lean();
        const teacherRole = await mongoose.model('Role').findOne({ name: 'teacher' }).select('_id').lean();

        if (!studentRole || !teacherRole) {
            return res.status(500).json({ message: 'Role not found' });
        }

        const [studentCount, teacherCount] = await Promise.all([
            userModel.countDocuments({ role: studentRole._id }),
            userModel.countDocuments({ role: teacherRole._id })
        ]);

        const stats = [{
            students: studentCount,
            teachers: teacherCount
        }];

        // Apply pagination (though typically one stats object)
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedStats = stats.slice(startIndex, startIndex + limitNum);

        res.status(200).json({
            stats: paginatedStats,
            total: stats.length,
            page: pageNum,
            pages: Math.ceil(stats.length / limitNum)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

