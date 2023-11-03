import { Router } from "express";
import { createPostSignInController } from "../controllers/auth/post-sign-in.controller";
import { createPostSignUpController } from "../controllers/auth/post-sign-up.controller";
import { IUserModel } from "../db/interfaces/user-model.interface";

export function createAuthRouter(userModel: IUserModel): Router {
    const router = Router();
    router.post("/sign-up", createPostSignUpController(userModel));
    router.post("/sign-in", createPostSignInController(userModel));
    return router;
}
