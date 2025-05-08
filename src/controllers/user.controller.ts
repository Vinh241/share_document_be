import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";

class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Get all users with pagination and search
  getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;

      const result = await this.userRepository.findAll({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
      });

      return res.json({
        status: "success",
        data: {
          users: result.users,
          total: result.total,
          totalPages: result.totalPages,
          currentPage: Number(page),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get user by ID
  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findById(Number(id));
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Remove password hash for security
      const { password_hash, ...userWithoutPassword } = user;

      return res.json({
        status: "success",
        data: {
          user: userWithoutPassword,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Create a new user
  createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { email, password, full_name, phone_number, is_admin } = req.body;

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
        is_admin: is_admin || false,
      });

      // Remove password hash for security
      const { password_hash: _, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        status: "success",
        data: {
          user: userWithoutPassword,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Update user
  updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { id } = req.params;
      const { email, password, full_name, phone_number, is_admin } = req.body;

      // Check if user exists
      const existingUser = await this.userRepository.findById(Number(id));
      if (!existingUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Check if email is being changed and is already in use
      if (email && email !== existingUser.email) {
        const userWithEmail = await this.userRepository.findByEmail(email);
        if (userWithEmail && userWithEmail.id !== Number(id)) {
          return res.status(400).json({
            status: "error",
            message: "Email already in use",
          });
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (email) updateData.email = email;
      if (full_name) updateData.full_name = full_name;
      if (phone_number !== undefined) updateData.phone_number = phone_number;
      if (is_admin !== undefined) updateData.is_admin = is_admin;

      // Handle password update if provided
      if (password) {
        const saltRounds = 10;
        updateData.password_hash = await bcrypt.hash(password, saltRounds);
      }

      // Update user
      const updatedUser = await this.userRepository.update(
        Number(id),
        updateData
      );
      if (!updatedUser) {
        return res.status(500).json({
          status: "error",
          message: "Failed to update user",
        });
      }

      // Remove password hash for security
      const { password_hash: _, ...userWithoutPassword } = updatedUser;

      return res.json({
        status: "success",
        data: {
          user: userWithoutPassword,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete user
  deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = await this.userRepository.findById(Number(id));
      if (!existingUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Delete user
      const deleted = await this.userRepository.delete(Number(id));
      if (!deleted) {
        return res.status(500).json({
          status: "error",
          message: "Failed to delete user",
        });
      }

      return res.json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
