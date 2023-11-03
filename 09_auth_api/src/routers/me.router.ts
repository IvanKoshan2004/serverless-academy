import { Router } from "express";
import { getMeController } from "../controllers/me/get-me.controller";
import { authenticateUserMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("", authenticateUserMiddleware, getMeController);

export default router;
