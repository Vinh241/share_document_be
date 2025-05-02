import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import config from "../config";
import { SignOptions } from "jsonwebtoken";

class AuthController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { email, password, full_name, phone_number } = req.body;

      // Check if email already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Email already registered",
        });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await this.userRepository.create({
        email,
        password_hash: passwordHash,
        full_name,
        phone_number,
      });

      // Generate token
      const signOptions: SignOptions = {
        expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
      };
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        config.jwt.secret,
        signOptions
      );

      return res.status(201).json({
        status: "success",
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.full_name,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Không tìm thấy tài khoản",
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      // Generate token
      const signOptions: SignOptions = {
        expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
      };
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        signOptions
      );

      return res.json({
        status: "success",
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            is_admin: user?.is_admin ?? false,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get current user
  getMe = async (
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

      const user = await this.userRepository.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      return res.json({
        status: "success",
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone_number: user.phone_number,
            is_admin: user?.is_admin ?? false,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
