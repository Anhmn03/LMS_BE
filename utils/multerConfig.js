const multer = require("multer");
const path = require("path");

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Lưu file vào public/uploads/
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Tạo tên file duy nhất
  },
});

// Bộ lọc định dạng file
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpg|jpeg|png|gif/;
  const allowedVideoTypes = /mp4|webm|ogg/;

  const isImage = allowedImageTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const isVideo = allowedVideoTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (file.fieldname === "image" && isImage) {
    cb(null, true);
  } else if (file.fieldname === "shortIntroVideo" && isVideo) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// Khởi tạo multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file (10MB)
}).fields([
  { name: "image", maxCount: 1 }, // Trường image, tối đa 1 file
  { name: "shortIntroVideo", maxCount: 1 }, // Trường shortIntroVideo, tối đa 1 file
]);

module.exports = upload;
