const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const bodyParser = require("body-parser");
const usersRouter = require("./routers/usersRouter");
const userModel = require("./models/user.model");
const lessonRouter = require("./routers/lessonRouter");
const courseRouter = require("./routers/courseRouter");
const cartRouter = require("./routers/cartRouter");
const enrollmentRouter = require("./routers/enrollmentRouter");
const paymentRouter = require("./routers/paymentRouter");
dotenv.config();
connectDB();

const app = express();
// Xử lý CORS
app.use(cors());
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), paymentRouter);
// Xử lý JSON và form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));

app.use("/api/users", usersRouter);

app.use("/api/all",async (req, res) => {
    try {
        const users = await userModel.find();
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
      }
})
app.use("/api/lessons", lessonRouter);
app.use("/api/courses", courseRouter);
app.use("/api/cart", cartRouter);
app.use("/api/enrollments", enrollmentRouter);
app.use("/api/payments", paymentRouter);
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});