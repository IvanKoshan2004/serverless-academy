type UserId = number;
export type User = {
    id: UserId;
    email: string;
};
export interface IUserModel {
    getUser(id: UserId): Promise<User | null>;
    registerUser(email: string, password: string): Promise<User>;
    loginUser(email: string, password: string): Promise<User>;
}
