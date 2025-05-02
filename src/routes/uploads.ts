import { Router } from "express";
import * as uploadController from "../controllers/uploadController";
import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";

const router = Router();

// Yêu cầu đăng nhập và quyền admin cho tất cả các route upload
router.use(authenticate);
router.use(requireAdmin);

// Route upload ảnh sản phẩm
router.post(
  "/images",
  uploadMiddleware.array("images", 10),
  uploadController.uploadImages
);

export default router;
