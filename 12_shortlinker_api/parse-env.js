import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

export function parseEnv(envPath) {
    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    const absPath = resolve(__dirname, envPath);
    const file = readFileSync(absPath, "utf-8");
    const lines = file.split("\n");
    for (const line of lines) {
        const [key, value] = line.split("=");
        process.env[key] = value;
    }
}
