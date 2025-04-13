import { Request, Response, NextFunction } from "express";

// Custom error class for application errors
export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  // Handle Knex.js / database errors
  if (err.code === "23505") {
    // Unique violation in PostgreSQL
    err.message = "Duplicate field value: please use another value";
    err.statusCode = 400;
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    err.message = err.message || "Invalid input data";
    err.statusCode = 400;
  }

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
};
