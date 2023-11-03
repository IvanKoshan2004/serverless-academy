import { NextFunction, Request, Response } from "express";

export function authenticateUserMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    next();
}
