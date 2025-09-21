import { Router } from "express";
import { health } from "@/handlers/health";

const router = Router();

router.get("/", health);

export { router as healthRoutes };
