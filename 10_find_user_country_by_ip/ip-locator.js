import { createReadStream } from "fs";
import { createInterface } from "readline";
export class IpLocator {
    #ranges;
    constructor() {
        this.#ranges = null;
    }
    async initialize(ipRangesCsvPath) {
        return new Promise((resolve) => {
            const rs = createReadStream(ipRangesCsvPath, "utf-8");
            const readline = createInterface({ input: rs });
            const ranges = [];
            readline.on("line", (line) => {
                const trimmedLine = line.slice(1, -1);
                const csvEntries = trimmedLine.split('","');
                ranges.push({
                    rangeStart: parseInt(csvEntries[0]),
                    rangeEnd: parseInt(csvEntries[1]),
                    countryCode: csvEntries[2],
                    countryName: csvEntries[3],
                });
            });
            readline.on("close", () => {
                this.#ranges = ranges;
                resolve();
            });
        });
    }
    findIpData(ipv4) {
        if (this.#ranges === null) {
            throw Error("Ip Locator not initialized");
        }
        const ipv4int = IpLocator.convertIpv4ToInt(ipv4);

        let low = 0;
        let high = this.#ranges.length;
        let mid;
        while (low < high) {
            mid = Math.floor((high + low) / 2);
            const midRange = this.#ranges[mid];
            if (
                midRange.rangeStart <= ipv4int &&
                midRange.rangeEnd >= ipv4int
            ) {
                return {
                    rangeStart: IpLocator.convertIntToIpv4(midRange.rangeStart),
                    rangeEnd: IpLocator.convertIntToIpv4(midRange.rangeEnd),
                    countryCode: midRange.countryCode,
                    countryName: midRange.countryName,
                };
            } else if (midRange.rangeStart > ipv4int) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        return null;
    }
    static convertIpv4ToInt(ipv4) {
        const octets = ipv4.split(".").map((el) => {
            return parseInt(el);
        });
        if (octets.length !== 4) {
            throw Error("invalid ip format");
        }
        octets.forEach((el) => {
            if (el < 0 || el > 255) {
                throw Error("invalid ip format");
            }
        });
        let int = 0;
        for (let i = 0; i < 4; i++) {
            int += octets[octets.length - 1 - i] * 2 ** (i * 8);
        }
        return int;
    }
    static convertIntToIpv4(int) {
        if (int < 0 || int > 2 ** 32 - 1) {
            throw Error("integer out of range");
        }
        const octets = [];

        for (let i = 0; i < 4; i++) {
            const octet = int % 256;
            octets.unshift(octet);
            int = Math.floor(int / 256);
        }
        return octets.join(".");
    }
}
