import { Request, Response } from "express";
import { IUserModel } from "../../db/interfaces/user-model.interface";

export function createPostSignInController(userModel: IUserModel) {
    return (req: Request, res: Response) => {
        res.end("sign in");
    };
}
