import { Router } from "express";
import { createDocument, deleteDocument, getDocumentById, getDocuments, updateDocument } from "../controllers/documentController";

const router = Router();

router.get("/", getDocuments);
router.put("/update_document", updateDocument);
router.put("/delete_document", deleteDocument);
router.post("/create_document", createDocument);
router.get("/document", getDocumentById);
export default router;