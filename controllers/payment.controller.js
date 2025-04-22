const mongoose = require("mongoose");
const paymentModel = require("../models/payment.model");
exports.getPayments = async (req, res) => {     
    try {         
        const { page = 1, limit = 10, studentId, courseId, status, startDate, endDate } = req.query;         
        const pageNum = parseInt(page);         
        const limitNum = parseInt(limit);          
        const query = {}; 

        // Lọc theo studentId, courseId
        if (studentId) query.studentId = studentId;         
        if (courseId) query.courseId = courseId;

        // Lọc theo trạng thái nếu có, nếu không sẽ trả tất cả các trạng thái
        if (status) query.status = status;  

        // Lọc theo ngày nếu có
        if (startDate || endDate) {             
            query.paymentDate = {};             
            if (startDate) query.paymentDate.$gte = new Date(startDate);             
            if (endDate) query.paymentDate.$lte = new Date(endDate);         
        }          

        // Lấy danh sách các giao dịch
        const payments = await paymentModel.find(query)             
            .select('studentId courseId amount status paymentDate createdAt')             
            .populate('studentId', 'fullName email')             
            .populate('courseId', 'title')             
            .skip((pageNum - 1) * limitNum)             
            .limit(limitNum)             
            .lean();          

        // Lấy tổng số giao dịch
        const totalPayments = await paymentModel.countDocuments(query);          

        // Trả kết quả
        res.status(200).json({             
            payments,             
            total: totalPayments,             
            page: pageNum,             
            pages: Math.ceil(totalPayments / limitNum)         
        });     
    } catch (error) {         
        res.status(500).json({ message: error.message });     
    } 
};
