import { Router } from "express";
import { authenticateUser } from "@/middleware/auth";
import {
  createUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "@/handlers/auth";

const router = Router();

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/me", authenticateUser, getCurrentUser);
router.post("/logout", logoutUser);

export { router as authRoutes };
