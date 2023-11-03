import { NextFunction, Request, RequestHandler, Response } from "express";
import { IUserModel } from "../db/interfaces/user-model.interface";

export function createAuthenticateUserMiddleware(userModel: IUserModel) {
    return (req: Request, res: Response, next: NextFunction) => {
        next();
    };
}
