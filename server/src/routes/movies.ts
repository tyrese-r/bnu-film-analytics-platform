import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import {
  getAllMovies,
  getMovieById,
  createMovie,
  searchOMDBMovies,
  getMovieReviews,
} from "@/handlers/movies";

const router = Router();

router.get("/", getAllMovies);
router.get("/:id", getMovieById);
router.post("/", authenticateUser, createMovie);
router.get("/search/omdb", searchOMDBMovies);
router.get("/:id/reviews", getMovieReviews);

export { router as movieRoutes };
