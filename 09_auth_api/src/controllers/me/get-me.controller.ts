import { Request, Response } from "express";
export function createGetMeController() {
    return (req: Request, res: Response) => {
        const { id, email } = req.user!;
        res.status(200);
        res.send({
            status: true,
            data: {
                id: id,
                email: email,
            },
        });
    };
}
