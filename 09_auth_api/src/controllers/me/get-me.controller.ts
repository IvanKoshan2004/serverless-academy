import { Request, Response } from "express";

export function getMeController(req: Request, res: Response) {
    res.end("me");
}
