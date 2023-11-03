import { Request, Response } from "express";

export function postSignInController(req: Request, res: Response) {
    res.end("sign in");
}
