import { User } from "../../db/interfaces/user-model.interface";
declare global {
    namespace Express {
        export interface Request {
            user?: User;
        }
    }
}
