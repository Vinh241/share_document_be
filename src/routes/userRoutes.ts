import { Router } from "express";
import { createUser, deleteUser, deleteUserPermanently, getAllUsers, getUserById, register, updateUser } from "../controllers/userController";

const router = Router();

router.post("/register", register);
router.get("/all_users", getAllUsers);
router.post("/create_user", createUser);
router.put("/update_user", updateUser);
router.put("/delete_user", deleteUser);
router.delete("/delete_permanently_user", deleteUserPermanently);
router.get("/user", getUserById);
export default router;
