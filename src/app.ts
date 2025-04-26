import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import config from "./config";
import path from "path";

const app = express();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginResourcePolicy: false, // Allow loading resources from different origins
  })
);
app.use(
  cors({
    origin: config.cors.origins,
    credentials: config.cors.enabled,
  })
);
app.use(express.json());

// Serve static files from the public directory
const publicPath = path.join(__dirname, "../public");
console.log(`Serving static files from: ${publicPath}`);
app.use(express.static(publicPath));

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

export default app;
