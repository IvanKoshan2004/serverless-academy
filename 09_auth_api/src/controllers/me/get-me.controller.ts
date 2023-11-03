import { Request, Response } from "express";
import { IUserModel } from "../../db/interfaces/user-model.interface";

export function createGetMeController(userModel: IUserModel) {
    return (req: Request, res: Response) => {
        res.end("me");
    };
}
