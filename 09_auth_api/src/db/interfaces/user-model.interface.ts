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
    registerUser(email: string, password: string): Promise<UserCredentials>;
    loginUser(email: string, password: string): Promise<UserCredentials>;
    verifyAccessJwt(accessToken: string): Promise<User | null>;
    refreshJwt(refreshToken: string): Promise<UserCredentials>;
}
