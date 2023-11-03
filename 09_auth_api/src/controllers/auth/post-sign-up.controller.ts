import { Request, Response } from "express";
import { validateEmail } from "../../lib/email.validation";
import { validatePassword } from "../../lib/password.validation";
import { IUserModel } from "../../db/interfaces/user-model.interface";

export function createPostSignUpController(userModel: IUserModel) {
    return (req: Request, res: Response) => {
        const { email, password } = req.body;
        const emailValidationMessage = validateEmail(email);
        if (emailValidationMessage !== "") {
            res.status(409);
            res.send({ status: false, error: emailValidationMessage });
            return;
        }
        const passwordValidationMessage = validatePassword(password);
        if (passwordValidationMessage !== "") {
            res.status(409);
            res.send({ status: false, error: passwordValidationMessage });
            return;
        }

        res.end("sign up");
    };
}
