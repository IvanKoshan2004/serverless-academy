export function validatePassword(password: string): string {
    if (password.length < 8) {
        return "Password should be at least 8 characters long";
    }
    return "";
}
