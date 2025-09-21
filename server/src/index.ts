import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { healthRoutes } from "./routes/health";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? false : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Film Platform Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
    },
  });
});

app.use("/api/v1/health", healthRoutes);

app.listen(PORT, () => {
  console.log(`--> Server is listening on port ${PORT}`);
  console.log(`--> http://localhost:${PORT}/health looking healthy`);
});

export default app;
