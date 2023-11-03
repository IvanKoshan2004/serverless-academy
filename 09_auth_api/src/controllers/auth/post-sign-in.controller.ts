import { Request, Response } from "express";
import { IUserModel } from "../../db/interfaces/user-model.interface";
import { UnauthorizedError } from "../../lib/errors/unauthorized.error";
import { EntityNotFoundError } from "../../lib/errors/entity-not-found.error";

export function createPostSignInController(userModel: IUserModel) {
    return async (req: Request, res: Response) => {
        const { email, password } = req.body;
        try {
            const user = await userModel.loginUser(email, password);
            res.status(200);
            res.send({
                status: true,
                data: {
                    id: user.id,
                    accessToken: "string",
                    refreshToken: "string",
                },
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
