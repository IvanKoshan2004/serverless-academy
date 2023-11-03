import { readFileSync, writeFileSync, existsSync, createReadStream } from "fs";
export class DBStorage {
    constructor(dbName) {
        this.fileName = dbName + ".txt";
        this.fullPath = new URL(`./${this.fileName}`, import.meta.url);
    }
    async write(object) {
        const serializedObject = JSON.stringify(object);
        let flag = existsSync(this.fullPath) ? "a" : "w";
        writeFileSync(this.fullPath, serializedObject + "\n", {
            encoding: "utf-8",
            flag: flag,
        });
    }
    async readAll() {
        if (!existsSync(this.fullPath)) {
            throw Error("File doensn't exist");
        }
        const fileContent = readFileSync(this.fullPath, {
            encoding: "utf-8",
        });
        const lines = fileContent.split("\n");
        const objects = [];
        for (const line of lines) {
            try {
                const object = JSON.parse(line);
                objects.push(object);
            } catch (e) {}
        }
        return objects;
    }
    async searchKeyValue(
        key,
        value,
        options = {
            caseSensetive: true,
            hammingDistance: 0,
        }
    ) {
        return new Promise((resolve, reject) => {
            const objects = [];
            const rs = createReadStream(this.fullPath, "utf-8");
            let lastChunkLine = "";
            rs.on("data", (chunk) => {
                const lines = chunk.split("\n").filter((el) => el != "");
                lines[0] = lastChunkLine.concat(lines[0]);
                for (const line of lines) {
                    try {
                        const object = JSON.parse(line);
                        if (!object.hasOwnProperty(key)) continue;
                        if (DBStorage.valueFit(value, object[key], options)) {
                            objects.push(object);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
                lastChunkLine = lines[lines.length - 1];
            });
            rs.on("error", (e) => {
                rs.close();
                reject(e);
            });
            rs.on("end", () => {
                rs.close();
            });
            rs.on("close", () => {
                resolve(objects);
            });
        });
    }
    static valueFit(searchValue, currentValue, options) {
        if (!options.caseSensetive) {
            searchValue = searchValue.toLowerCase();
            currentValue = currentValue.toLowerCase();
        }
        const sBuf = Buffer.from(searchValue, "utf-8");
        const cBuf = Buffer.from(currentValue, "utf-8");
        const minLength = Math.min(cBuf.length, sBuf.length);
        let currentHammingDistance = 0;
        for (let i = 0; i < minLength; i++) {
            const xor = sBuf[i] ^ cBuf[i];
            if (xor != 0) {
                currentHammingDistance++;
                if (currentHammingDistance > options.hammingDistance) {
                    return false;
                }
            }
        }
        currentHammingDistance += Math.abs(sBuf.length - cBuf.length);
        if (currentHammingDistance > options.hammingDistance) {
            return false;
        }
        return true;
    }
}
