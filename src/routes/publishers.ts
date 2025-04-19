import { Router } from "express";
import * as publisherController from "../controllers/publisherController";

const router = Router();

// Get all publishers
router.get("/", publisherController.getPublishers);

// Get publisher by ID
router.get("/:id", publisherController.getPublisherById);

// Create a new publisher
router.post("/", publisherController.createPublisher);

// Update a publisher
router.put("/:id", publisherController.updatePublisher);

// Delete a publisher
router.delete("/:id", publisherController.deletePublisher);

export default router;