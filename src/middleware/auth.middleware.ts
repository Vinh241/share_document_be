import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { UserRepository } from "../repositories/user.repository";

// Extend Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: number;
      email: string;
    };

    // Add user ID to request
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};

// Middleware to check if user exists
export const checkUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const userRepository = new UserRepository();
    const user = await userRepository.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
