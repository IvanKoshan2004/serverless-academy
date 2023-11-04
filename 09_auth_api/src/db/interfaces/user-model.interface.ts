export type UserId = number;
export type User = {
    id: UserId;
    email: string;
};
export type UserCredentials = {
    id: UserId;
    accessToken: string;
    refreshToken: string;
};
export interface IUserModel {
    getUser(id: UserId): Promise<User | null>;
    registerUser(email: string, password: string): Promise<UserCredentials>;
    loginUser(email: string, password: string): Promise<UserCredentials>;
    verifyJwt(token: string): Promise<User | null>;
}
