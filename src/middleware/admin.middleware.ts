import { Request, Response, NextFunction } from "express";
import db from "../database/connection";

/**
 * Middleware to check if the user has admin privileges
 */
export const requireAdmin = async (
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

    // Check if user is an admin
    const user = await db("users").where({ id: req.userId }).first();

    if (!user || !user.is_admin) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden - Admin access required",
      });
    }

    // Set isAdmin flag in the request object
    req.isAdmin = true;
    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Extend Express Request interface to include isAdmin property
declare global {
  namespace Express {
    interface Request {
      isAdmin?: boolean;
    }
  }
}
