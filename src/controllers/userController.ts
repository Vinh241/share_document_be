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
