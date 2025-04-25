const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const bodyParser = require("body-parser");
const usersRouter = require("./routers/usersRouter");
const courseManagerRouter = require("./routers/courseManagerRouter");
const courseRoutes = require("./routers/courseRoutes");
const authRouter = require("./routers/authRouter");
const courseRouter = require("./routers/courseRouter");
const cartRouter = require("./routers/cartRouter");
const enrollmentRouter = require("./routers/enrollmentRouter");
const paymentRouter = require("./routers/paymentRouter");
const lessonRouter = require("./routers/lessonRouter");
const statictisRouter = require("./routers/statictisRouter");
const categoryRouter = require("./routers/categoryRouter");

require("./models/category.model");
require("./models/course.model");
require("./models/enrollment.model");
require("./models/lesson.model");
require("./models/user.model");
require("./models/role.model");
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
app.use("/api/coursesManager", courseManagerRouter);
app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRouter);
app.use("/api/lessons", lessonRouter);
app.use("/api/courses", courseRouter);
app.use("/api/cart", cartRouter);
app.use("/api/enrollments", enrollmentRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/category", categoryRouter);
app.use("/api/statictis", statictisRouter);

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
