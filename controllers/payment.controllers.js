const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Course = require("../models/course.model");
const Payment = require("../models/payment.model");
const Enrollment = require("../models/enrollment.model");
const Cart = require("../models/cart.model");

// API thanh toán chung cho cả khóa học đơn lẻ và nhiều khóa học từ giỏ hàng
exports.createCheckoutSession = async (req, res) => {
    try {
        const { courseId, cartItemIds } = req.body;
        const userId = req.user._id;
        
        let lineItems = [];
        let metadata = {
            userId: userId
        };
        
        // Nếu có cartItemIds, xử lý theo kiểu giỏ hàng
        if (cartItemIds && Array.isArray(cartItemIds) && cartItemIds.length > 0) {
            // Lấy các mục trong giỏ hàng đã chọn
            const cartItems = await Cart.find({
                _id: { $in: cartItemIds },
                studentId: userId
            }).populate("courseId");
            
            if (cartItems.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No selected items found in cart"
                });
            }
            
            // Tạo danh sách các khóa học để thanh toán
            const courseIds = [];
            
            for (const item of cartItems) {
                const course = item.courseId;
                if (!course) continue;
                
                lineItems.push({
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: course.title,
                            description: course.description.substring(0, 200),
                            images: course.image ? [course.image] : [],
                        },
                        unit_amount: course.price * 100, // Stripe uses cents
                    },
                    quantity: 1,
                });
                
                courseIds.push(course._id.toString());
            }
            
            if (courseIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No valid courses found in selected items"
                });
            }
            
            // Nếu chỉ có một khóa học, sử dụng type="single"
            // Nếu nhiều hơn một, sử dụng type="cart"
            if (courseIds.length === 1) {
                metadata.type = "single";
                metadata.courseId = courseIds[0];
            } else {
                metadata.type = "cart";
                metadata.courseIds = JSON.stringify(courseIds);
            }
        }
        // Nếu có courseId, xử lý thanh toán một khóa học cụ thể
        else if (courseId) {
            // Tìm khóa học
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: "Course not found"
                });
            }
            
            lineItems = [{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: course.title,
                        description: course.description.substring(0, 200),
                        images: course.image ? [course.image] : [],
                    },
                    unit_amount: course.price * 100, // Stripe uses cents
                },
                quantity: 1,
            }];
            
            metadata.type = "single";
            metadata.courseId = courseId;
        }
        // Nếu không có cả courseId và cartItemIds
        else {
            // Thử lấy tất cả giỏ hàng của người dùng
            const cartItems = await Cart.find({ studentId: userId }).populate("courseId");
            
            if (cartItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Your cart is empty. Please add courses to cart or provide a courseId."
                });
            }
            
            // Tạo danh sách các khóa học để thanh toán
            const courseIds = [];
            
            for (const item of cartItems) {
                const course = item.courseId;
                if (!course) continue;
                
                lineItems.push({
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: course.title,
                            description: course.description.substring(0, 200),
                            images: course.image ? [course.image] : [],
                        },
                        unit_amount: course.price * 100, // Stripe uses cents
                    },
                    quantity: 1,
                });
                
                courseIds.push(course._id.toString());
            }
            
            if (courseIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No valid courses found in your cart"
                });
            }
            
            // Nếu chỉ có một khóa học, sử dụng type="single"
            // Nếu nhiều hơn một, sử dụng type="cart"
            if (courseIds.length === 1) {
                metadata.type = "single";
                metadata.courseId = courseIds[0];
            } else {
                metadata.type = "cart";
                metadata.courseIds = JSON.stringify(courseIds);
            }
        }
        
        // Tạo phiên thanh toán Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/payment/success`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
            metadata: metadata,
        });
        
        res.json({
            success: true,
            id: session.id,
            url: session.url
        });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({
            success: false,
            message: "Error creating checkout session",
            error: error.message
        });
    }
};

// Webhook xử lý khi thanh toán thành công
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Xử lý sự kiện checkout.session.completed
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        
        // Lấy metadata
        const { userId, type } = session.metadata;
        
        try {
            // Xử lý thanh toán một khóa học
            if (type === "single") {
                const { courseId } = session.metadata;
                
                // Tạo bản ghi thanh toán
                await Payment.create({
                    studentId: userId,
                    courseId: courseId,
                    paymentId: session.id,
                    amount: session.amount_total / 100,
                    status: "COMPLETED",
                    paymentMethod: "CARD",
                });
                
                // Tự động đăng ký khóa học
                await enrollCourse(userId, courseId);
                
                // Xóa khỏi giỏ hàng nếu có
                await Cart.findOneAndDelete({ studentId: userId, courseId });
            }
            // Xử lý thanh toán nhiều khóa học
            else if (type === "cart") {
                const courseIds = JSON.parse(session.metadata.courseIds);
                
                // Tính toán giá từng khóa học
                // Ở đây chúng ta chia đều tổng số tiền cho tất cả các khóa học
                // Trong thực tế, bạn nên lưu giá của từng khóa học trong metadata
                const totalAmount = session.amount_total / 100;
                const amountPerCourse = totalAmount / courseIds.length;
                
                // Xử lý từng khóa học
                for (const courseId of courseIds) {
                    // Tạo bản ghi thanh toán
                    await Payment.create({
                        studentId: userId,
                        courseId,
                        paymentId: session.id,
                        amount: amountPerCourse,
                        status: "COMPLETED",
                        paymentMethod: "CARD",
                    });
                    
                    // Tự động đăng ký khóa học
                    await enrollCourse(userId, courseId);
                    
                    // Xóa khỏi giỏ hàng
                    await Cart.findOneAndDelete({ studentId: userId, courseId });
                }
            }
        } catch (error) {
            console.error("Error processing payment:", error);
        }
    }
    
    res.json({ received: true });
};

// Hàm trợ giúp để đăng ký khóa học
async function enrollCourse(studentId, courseId) {
    try {
        // Kiểm tra xem đã đăng ký chưa
        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (existingEnrollment) {
            return; // Đã đăng ký rồi, không làm gì cả
        }
        
        // Tạo bản ghi đăng ký mới
        await Enrollment.create({ 
            studentId, 
            courseId,
            enrollmentDate: new Date()
        });
        
        console.log(`User ${studentId} successfully enrolled in course ${courseId}`);
    } catch (error) {
        console.error(`Error enrolling course: ${error.message}`);
        throw error;
    }
}