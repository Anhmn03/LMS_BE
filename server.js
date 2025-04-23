const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const bodyParser = require("body-parser");
const usersRouter = require("./routers/usersRouter");
const userModel = require("./models/user.model");
const courseRoutes = require("./routers/courseRoutes");
dotenv.config();
connectDB();

const app = express();
// Xử lý CORS
app.use(cors());

// Xử lý JSON và form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));

app.use("/api/users", usersRouter);
app.use("/api/courses", courseRoutes);

app.use("/api/all",async (req, res) => {
    try {
        const users = await userModel.find();
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
      }
})
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});