import { Router } from "express";
import { health } from "../features/health/handlers";

const router = Router();

router.get("/", health);

export { router as healthRoutes };
