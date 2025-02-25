import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import db from "../database/connection";
import { AppError } from "../middleware/errorHandler";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Check if user exists
    const existingUser = await db("users")
      .where("email", email)
      .orWhere("username", username)
      .first();

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate referral code
    const referralCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    // Create user
    const [user] = await db("users")
      .insert({
        username,
        email,
        password_hash: passwordHash,
        full_name: fullName,
        referral_code: referralCode,
        status: "pending",
      })
      .returning([
        "user_id",
        "username",
        "email",
        "full_name",
        "referral_code",
        "status",
      ]);

    res.status(201).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


//getAll users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const username = req.query.username as string;

    const baseQuery = db("users")
      .select(
        "user_id",
        "username",
        "email",
        "full_name",
        "phone",
        "balance",
        "referral_code",
        "status",
        "created_at",
        "updated_at"
      )
      .where("is_deleted", false);

    if (status) baseQuery.where("status", status);
    if (username) baseQuery.where("username", "ilike", `%${username}%`);

    const countQuery = db("users")
      .count("user_id as total")
      .where("is_deleted", false);

    if (status) countQuery.where("status", status);
    if (username) countQuery.where("username", "ilike", `%${username}%`);

    const [count] = await countQuery;
    const total = Number(count.total); // 🔹 Ép kiểu về number

    const users = await baseQuery
      .offset((page - 1) * limit) // ✅ Đã sửa lỗi phép toán số học
      .limit(limit); // ✅ Đã ép kiểu `limit` là `number`

    return res.json({
      status: "success",
      data: users,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit), // ✅ Đã ép kiểu `limit` về `number`
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};


//createUser
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, full_name, phone, balance } = req.body;

    // Kiểm tra xem user đã tồn tại hay chưa
    const existingUser = await db("users")
      .where("username", username)
      .orWhere("email", email)
      .first();

    if (existingUser) {
      throw new AppError("Username hoặc email đã tồn tại", 400);
    }

    // Hash password
    const hashedPassword = password;

    // Tạo user
    const [newUser] = await db("users")
      .insert({
        username,
        email,
        password_hash: hashedPassword,
        full_name,
        phone,
        balance: balance || 0, // Mặc định balance = 0 nếu không truyền
        referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: "pending",
      })
      .returning(["user_id", "username", "email", "full_name", "phone", "balance", "status"]);

    res.status(201).json({ status: "success", data: newUser });
  } catch (error) {
    next(error);
  }
};


//updateUser
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;
    const { password, full_name, phone, balance, status } = req.body;

    // Lấy thông tin user hiện tại
    const user = await db("users").where("user_id", id).first();
    if (!user) {
      throw new AppError("User không tồn tại", 404);
    }

    // Hash password nếu có cập nhật
    let updatedFields: any = { full_name, phone, balance, status };
    if (password) {
      updatedFields.password_hash = password;
    }

    // Cập nhật user
    const updatedUser = await db("users")
  .where("user_id", id)
  .update(updatedFields)
  .returning(["user_id", "full_name", "password_hash", "phone", "balance", "status", "updated_at"]);

if (!updatedUser || updatedUser.length === 0) {
  throw new AppError("Không tìm thấy user để cập nhật", 404);
}

res.status(200).json({ status: "success", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

//deleteUser
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ status: "error", message: "Thiếu user_id" });
    }

    const existingUser = await db("users").where({ user_id: id, is_deleted: false }).first();
    if (!existingUser) {
      return res.status(404).json({ status: "error", message: "Người dùng không tồn tại" });
    }

    await db("users")
      .where({ user_id: id })
      .update({
        status: "pending",
        is_deleted: true,
        updated_at: db.fn.now(),
      });

    return res.json({
      status: "success",
      message: "Người dùng đã được xóa",
    });
  } catch (error) {
    next(error);
  }
};


//deleteUserPermanently
export const deleteUserPermanently = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;

    // Kiểm tra user có tồn tại không
    const user = await db("users").where("user_id", id).first();
    if (!user) {
      throw new AppError("User không tồn tại", 404);
    }

    // Xóa user khỏi database
    await db("users").where("user_id", id).del();

    res.status(200).json({ status: "success", message: "User đã bị xóa vĩnh viễn" });
  } catch (error) {
    next(error);
  }
};


//getUserById
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.body; // Nhận user_id từ body

    if (!user_id) {
      return res.status(400).json({ message: "user_id là bắt buộc trong body" });
    }

    const user = await db("users")
      .select("user_id", "username", "email", "full_name", "phone", "balance", "status", "created_at", "updated_at")
      .where({ user_id })
      .first();

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json({ status: "success", data: user }); // Đảm bảo có return
  } catch (error) {
    next(error); // Lỗi phải được bắt
    return; // Để tránh lỗi TS7030
  }
};

