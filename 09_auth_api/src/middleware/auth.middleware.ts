import { NextFunction, Request, RequestHandler, Response } from "express";
import { IUserModel } from "../db/interfaces/user-model.interface";
import { extractBearerToken } from "../lib/extract-bearer-token";

export function createAuthenticateUserMiddleware(userModel: IUserModel) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers["authorization"];
        if (authHeader === undefined) {
            res.send({ status: false, error: "User not authorized" });
            return;
        }
        const token = extractBearerToken(authHeader);
        const user = await userModel.verifyAccessJwt(token);
        if (user === null) {
            res.send({ status: false, error: "Invalid access token" });
            return;
        }
        req.user = user;
        next();
    };
}
