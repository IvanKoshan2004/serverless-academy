import { readFileSync } from "fs";
import { resolve } from "path";
export function parseEnv(envPath: string): void {
    const absPath = resolve(__dirname, envPath);
    const file = readFileSync(absPath, "utf-8");
    const lines = file.split("\n");
    for (const line of lines) {
        const [key, value] = line.split("=");
        process.env[key] = value;
    }
}
