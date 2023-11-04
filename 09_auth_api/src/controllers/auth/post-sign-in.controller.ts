import { Request, Response } from "express";
import { IUserModel } from "../../db/interfaces/user-model.interface";
import { UnauthorizedError } from "../../lib/errors/unauthorized.error";
import { EntityNotFoundError } from "../../lib/errors/entity-not-found.error";
import { extractBearerToken } from "../../lib/extract-bearer-token";

export function createPostSignInController(userModel: IUserModel) {
    return async (req: Request, res: Response) => {
        try {
            const authHeader = req.headers["authorization"];
            let userCredentials;
            if (authHeader !== undefined) {
                const refreshToken = extractBearerToken(authHeader);
                userCredentials = await userModel.refreshJwt(refreshToken);
            } else {
                const { email, password } = req.body;
                userCredentials = await userModel.loginUser(email, password);
            }
            res.status(200);
            res.send({
                status: true,
                data: userCredentials,
            });
        } catch (e: any) {
            if (e.name == UnauthorizedError.name) {
                res.status(401);
            } else if (e.name == EntityNotFoundError.name) {
                res.status(404);
            }
            res.send({ status: false, error: e.message });
            return;
        }
    };
}
