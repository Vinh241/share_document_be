import { Request, Response, NextFunction } from "express";
import * as publisherService from "../services/publisherService";
import { AppError } from "../middleware/errorHandler";

/**
 * Get all publishers
 */
export const getPublishers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const publishers = await publisherService.getPublishers();
    res.json(publishers);
  } catch (error) {
    next(error);
  }
};

/**
 * Get publisher by ID
 */
export const getPublisherById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const publisherId = Number(req.params.id);
    if (isNaN(publisherId)) {
      throw new AppError("Invalid publisher ID", 400);
    }

    const publisher = await publisherService.getPublisherById(publisherId);
    if (!publisher) {
      throw new AppError("Publisher not found", 404);
    }

    res.json(publisher);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new publisher
 */
export const createPublisher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const publisherData = req.body;

    // Basic validation
    if (!publisherData.name) {
      throw new AppError("Name is required", 400);
    }

    const newPublisher = await publisherService.createPublisher(publisherData);
    res.status(201).json(newPublisher);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a publisher
 */
export const updatePublisher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const publisherId = Number(req.params.id);
    if (isNaN(publisherId)) {
      throw new AppError("Invalid publisher ID", 400);
    }

    const publisherData = req.body;
    const updatedPublisher = await publisherService.updatePublisher(
      publisherId,
      publisherData
    );

    if (!updatedPublisher) {
      throw new AppError("Publisher not found", 404);
    }

    res.json(updatedPublisher);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a publisher
 */
export const deletePublisher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const publisherId = Number(req.params.id);
    if (isNaN(publisherId)) {
      throw new AppError("Invalid publisher ID", 400);
    }

    const isDeleted = await publisherService.deletePublisher(publisherId);

    if (!isDeleted) {
      throw new AppError("Publisher not found", 404);
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};