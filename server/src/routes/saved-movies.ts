import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import {
  getMySavedMovies,
  saveMovie,
  deleteSavedMovie,
} from "../features/saved-movies/handlers";

const router = Router();

// Routes
router.get("/", authenticateUser, getMySavedMovies);
router.post("/", authenticateUser, saveMovie);
router.delete("/:id", authenticateUser, deleteSavedMovie);

export { router as savedMovieRoutes };
