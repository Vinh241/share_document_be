import db from "../database/connection";
import { Publisher } from "../types";

/**
 * Find all publishers
 */
export const findAll = async () => {
  return db("publishers").select("*").orderBy("name", "asc");
};

/**
 * Find publisher by ID
 */
export const findById = async (id: number): Promise<Publisher | null> => {
  return db("publishers").where("id", id).first() || null;
};

/**
 * Create a new publisher
 */
export const create = async (
  publisher: Partial<Publisher>
): Promise<Publisher> => {
  const [newPublisher] = await db("publishers").insert(publisher).returning("*");
  return newPublisher;
};

/**
 * Update a publisher
 */
export const update = async (
  id: number,
  data: Partial<Publisher>
): Promise<Publisher | null> => {
  const [updatedPublisher] = await db("publishers")
    .where("id", id)
    .update(data)
    .returning("*");

  return updatedPublisher || null;
};

/**
 * Delete a publisher
 */
export const remove = async (id: number): Promise<boolean> => {
  const deleted = await db("publishers").where("id", id).delete();
  return deleted > 0;
};