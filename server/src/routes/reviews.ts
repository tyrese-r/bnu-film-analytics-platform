import { Router } from "express";
import { authenticateUser } from "@/middleware";
import {
  getAllReviews,
  getMyReviews,
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
} from "@/handlers/reviews";

const router = Router();

router.get("/", getAllReviews);
router.get("/me", authenticateUser, getMyReviews);
router.post("/", authenticateUser, createReview);
router.get("/:id", getReviewById);
router.patch("/:id", authenticateUser, updateReview);
router.delete("/:id", authenticateUser, deleteReview);

export { router as reviewRoutes };
