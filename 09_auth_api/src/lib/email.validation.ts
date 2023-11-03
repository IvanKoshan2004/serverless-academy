export function validateEmail(email: string): string {
    const emailRegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegExp.test(email)) {
        return "Email has invalid structure";
    }
    return "";
}
