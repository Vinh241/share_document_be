import { Request, Response, NextFunction } from "express";
import path from "path";
import { AppError } from "../middleware/errorHandler";

// Mở rộng kiểu Request để bao gồm files từ multer
interface MulterRequest extends Request {
  files: Express.Multer.File[];
}

/**
 * Upload nhiều ảnh
 */
export const uploadImages = async (
  req: MulterRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Kiểm tra xem có files được upload hay không
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError("Không có file ảnh nào được upload", 400);
    }

    // Lấy thông tin các file đã upload
    const uploadedFiles = req.files.map((file) => {
      // Tạo đường dẫn tương đối để lưu vào database
      const relativePath = `/images/products/${path.basename(file.path)}`;
      return {
        originalname: file.originalname,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        path: relativePath,
      };
    });

    // Trả về thông tin các file đã upload
    res.status(200).json({
      status: "success",
      message: `${uploadedFiles.length} file ảnh đã được upload thành công`,
      imageUrls: uploadedFiles.map((file) => file.path),
      files: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
};
