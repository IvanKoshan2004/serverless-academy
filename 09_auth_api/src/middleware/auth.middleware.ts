import { NextFunction, Request, RequestHandler, Response } from "express";
import { IUserModel } from "../db/interfaces/user-model.interface";

export function createAuthenticateUserMiddleware(userModel: IUserModel) {
    function extractToken(authHeader: string): string {
        const authHeaderSplit = authHeader.split(" ");
        if (authHeaderSplit[0] === "Bearer") {
            return authHeaderSplit[1];
        }
        return "";
    }
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers["authorization"];
        if (authHeader === undefined) {
            res.send({ status: false, error: "User not authorized" });
            return;
        }
        const token = extractToken(authHeader);
        const user = await userModel.verifyJwt(token);
        if (user === null) {
            res.send({ status: false, error: "Invalid token" });
            return;
        }
        req.user = user;
        next();
    };
}
