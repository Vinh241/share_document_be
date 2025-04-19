import { Publisher } from "../types";
import * as publisherRepository from "../repositories/publisherRepository";

/**
 * Get all publishers
 */
export const getPublishers = async (): Promise<Publisher[]> => {
  return publisherRepository.findAll();
};

/**
 * Get publisher by ID
 */
export const getPublisherById = async (id: number): Promise<Publisher | null> => {
  return publisherRepository.findById(id);
};

/**
 * Create a new publisher
 */
export const createPublisher = async (
  publisherData: Partial<Publisher>
): Promise<Publisher> => {
  return publisherRepository.create(publisherData);
};

/**
 * Update a publisher
 */
export const updatePublisher = async (
  id: number,
  publisherData: Partial<Publisher>
): Promise<Publisher | null> => {
  return publisherRepository.update(id, publisherData);
};

/**
 * Delete a publisher
 */
export const deletePublisher = async (id: number): Promise<boolean> => {
  return publisherRepository.remove(id);
};