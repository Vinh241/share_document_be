import db from "../database/connection";

interface User {
  id: number;
  email: string;
  phone_number?: string;
  password_hash: string;
  full_name: string;
  is_admin?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface CreateUserInput {
  email: string;
  phone_number?: string;
  password_hash: string;
  full_name: string;
}

export class UserRepository {
  async findById(id: number): Promise<User | null> {
    const user = await db("users").where({ id }).first();
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await db("users").where({ email }).first();
    return user || null;
  }

  async create(userData: CreateUserInput): Promise<User> {
    const [user] = await db("users").insert(userData).returning("*");
    return user;
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const [user] = await db("users")
      .where({ id })
      .update({ ...userData, updated_at: new Date() })
      .returning("*");
    return user || null;
  }
}
