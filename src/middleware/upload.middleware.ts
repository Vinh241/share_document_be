import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";

// Đảm bảo thư mục upload tồn tại
const uploadDir = path.join(__dirname, "../../public/images/products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: (_req: Express.Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Express.Request, file: Express.Multer.File, cb) => {
    // Tạo tên file duy nhất với uuid để tránh trùng lặp
    const uniquePrefix = uuidv4();
    // Lấy phần mở rộng của file
    const ext = path.extname(file.originalname);
    // Tạo tên file duy nhất: uuid + phần mở rộng
    cb(null, `${uniquePrefix}${ext}`);
  },
});

// Filter để chỉ chấp nhận file ảnh
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Kiểm tra mime type của file
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload file ảnh!"));
  }
};

// Cấu hình multer
export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn kích thước file 5MB
  },
});
