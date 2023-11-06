import mysql from "mysql2/promise";

export class ShortlinkService {
    #connection;
    #maxStoreBytes;
    #mysqlConfig;
    constructor(
        options = {
            maxStoreBytes: 2,
            mysqlConfig: {
                host: "",
                user: "",
                password: "",
                database: "",
            },
        }
    ) {
        this.#maxStoreBytes = options.maxStoreBytes;
        this.#mysqlConfig = options.mysqlConfig;
        this.initialized = false;
    }
    async initService() {
        if (this.initialized) {
            throw Error("Shortlink Service alread initialized");
        }
        this.#connection = await mysql.createConnection(this.#mysqlConfig);
        await this.#connection.connect();
        this.initialized = true;
    }
    async stopService() {
        await this.#connection.end();
    }
    async createShortLink(link) {
        if (!this.initialized) throw Error("Shortlink Service not initialized");
        const href = this.#getValidHref(link);
        if (href === null) throw Error("Bad url format");
        const createResult = await this.#connection.execute(
            "INSERT into links (link) values (?)",
            [href]
        );
        const insertId = createResult[0].insertId;
        const tag = this.#createTagFromNumber(insertId);
        await this.#connection.execute(
            "UPDATE links SET tag = ? WHERE id = ?",
            [tag, insertId]
        );
        return tag;
    }
    async getLinkByTag(tag) {
        if (!this.initialized) throw Error("Shortlink Service not initialized");
        const result = await this.#connection.execute(
            "SELECT link, change_time_stamp FROM links WHERE tag = ?",
            [tag]
        );
        const rows = result[0];
        if (rows.length == 0) {
            throw Error("Link not found");
        }
        return rows[rows.length - 1].link;
    }
    async tagExists(tag) {
        if (!this.initialized) throw Error("Shortlink Service not initialized");
        const result = await this.#connection.execute(
            "SELECT tag FROM links WHERE tag = ?",
            [tag]
        );
        const rows = result[0];
        return rows.length != 0;
    }
    #createTagFromNumber(number) {
        const bytes = [];
        for (let i = 0; i < this.#maxStoreBytes; i++) {
            bytes.push(number & 0xff);
            number = Math.floor(number / 256);
        }
        const buffer = Buffer.from(bytes.reverse());
        return buffer.toString("base64url");
    }
    #getValidHref(link) {
        try {
            return new URL(link).href;
        } catch (e) {
            return null;
        }
    }
    get maxStoreBytes() {
        return this.#maxStoreBytes;
    }
    get maxPossibleLinks() {
        return (2 ** 8) ** this.#maxStoreBytes;
    }
    get linkRouteLength() {
        const tripletsLenght = Math.floor(this.#maxStoreBytes / 3) * 4;
        let remainderLength;
        switch (this.#maxStoreBytes % 3) {
            case 0:
                remainderLength = 0;
                break;
            case 1:
                remainderLength = 2;
                break;
            case 2:
                remainderLength = 3;
                break;
        }
        return tripletsLenght + remainderLength;
    }
}
