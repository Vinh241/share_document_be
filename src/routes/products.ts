import { Router } from "express";
import db from "../database/connection";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const products = await db("products").select("*");
    console.log(products);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
});

export default router;
