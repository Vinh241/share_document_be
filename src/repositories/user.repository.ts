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
  is_admin?: boolean;
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

  async delete(id: number): Promise<boolean> {
    const deleted = await db("users").where({ id }).delete();
    return deleted > 0;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ users: User[]; total: number; totalPages: number }> {
    const { page = 1, limit = 10, search = "" } = params;
    const offset = (page - 1) * limit;

    // Build query
    let query = db("users")
      .select(
        "id",
        "email",
        "full_name",
        "phone_number",
        "is_admin",
        "created_at"
      )
      .orderBy("created_at", "desc");

    // Apply search if provided
    if (search) {
      query = query.where(function () {
        this.where("email", "ilike", `%${search}%`)
          .orWhere("full_name", "ilike", `%${search}%`)
          .orWhere("phone_number", "ilike", `%${search}%`);
      });
    }

    // Get total count for pagination
    const countQuery = db("users").count("id as count").first();
    if (search) {
      countQuery.where(function () {
        this.where("email", "ilike", `%${search}%`)
          .orWhere("full_name", "ilike", `%${search}%`)
          .orWhere("phone_number", "ilike", `%${search}%`);
      });
    }

    const countResult = await countQuery;
    const total = Number(countResult?.count || 0);

    // Apply pagination
    query = query.limit(limit).offset(offset);

    // Execute query
    const users = await query;

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
