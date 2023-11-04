export function extractBearerToken(authHeader: string): string {
    const authHeaderSplit = authHeader.split(" ");
    if (authHeaderSplit[0] === "Bearer") {
        return authHeaderSplit[1];
    }
    return "";
}
