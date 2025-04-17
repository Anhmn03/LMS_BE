const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const bodyParser = require("body-parser");

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
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});