import { RequestHandler, Router } from "express";
import { createGetMeController } from "../controllers/me/get-me.controller";
import { createAuthenticateUserMiddleware } from "../middleware/auth.middleware";
import { IUserModel } from "../db/interfaces/user-model.interface";

export function createMeRouter(userModel: IUserModel): Router {
    const router = Router();
    router.get(
        "",
        createAuthenticateUserMiddleware(userModel),
        createGetMeController()
    );
    return router;
}
