import { Router } from "express";
import { postSignInController } from "../controllers/auth/post-sign-in.controller";
import { postSignUpController } from "../controllers/auth/post-sign-up.controller";

const router = Router();
router.post("/sign-up", postSignUpController);
router.post("/sign-in", postSignInController);

export default router;
