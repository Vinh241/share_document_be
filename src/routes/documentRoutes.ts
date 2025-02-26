import { Router } from "express";
import {
  createDocument,
  getDocuments,
} from "../controllers/documentController";

const router = Router();

router.get("/", getDocuments).post("/create", createDocument);

export default router;
