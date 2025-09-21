import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { healthRoutes } from "./routes/health";
import { authRoutes } from "./routes/auth";
import { movieRoutes } from "./routes/movies";
import { savedMovieRoutes } from "./routes/saved-movies";
import { reviewRoutes } from "./routes/reviews";

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use("/api/v1/users", authRoutes);
app.use("/api/v1/movies", movieRoutes);
app.use("/api/v1/saved-movies", savedMovieRoutes);
app.use("/api/v1/reviews", reviewRoutes);

app.listen(PORT, () => {
  console.log(`--> Server is listening on port ${PORT}`);
  console.log(`--> http://localhost:${PORT}/health looking healthy`);
});

export default app;
