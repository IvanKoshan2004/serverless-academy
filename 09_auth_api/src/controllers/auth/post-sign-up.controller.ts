import { Request, Response } from "express";
import { validateEmail } from "../../lib/email.validation";
import { validatePassword } from "../../lib/password.validation";
import { IUserModel } from "../../db/interfaces/user-model.interface";
import { UniqueColumnError } from "../../lib/errors/unique-column.error";

export function createPostSignUpController(userModel: IUserModel) {
    return async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const emailValidationMessage = validateEmail(email);
        if (emailValidationMessage !== "") {
            res.status(400);
            res.send({ status: false, error: emailValidationMessage });
            return;
        }
        const passwordValidationMessage = validatePassword(password);
        if (passwordValidationMessage !== "") {
            res.status(400);
            res.send({ status: false, error: passwordValidationMessage });
            return;
        }
        try {
            const userCredentials = await userModel.registerUser(
                email,
                password
            );
            res.status(201);
            res.send({
                status: true,
                data: userCredentials,
            });
        } catch (e: any) {
            if (e.name == UniqueColumnError.name) {
                res.status(409);
            } else {
                res.status(500);
            }
            res.send({ status: false, error: e.message });
            return;
        }
    };
}
