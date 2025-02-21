import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import config from "./config";

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origins,
    credentials: config.cors.enabled,
  })
);
app.use(express.json());

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

export default app;
