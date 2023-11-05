import Koa from "koa";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { DBCore } from "./key-value-db.js";
import { jsonBodyParser } from "./json-body-parser.js";
import { randomBytes } from "crypto";

const PORT = process.env.PORT || 3000;
const JSON_ROUTE = "/json";
const DB_FOLDER_NAME = "db_data";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const dbFolderPath = resolve(__dirname, DB_FOLDER_NAME);

const app = new Koa();
const db = new DBCore(dbFolderPath);
await db.initDb();

app.use(jsonBodyParser);
app.use(async (ctx) => {
    if (ctx.path == JSON_ROUTE) {
        switch (ctx.method) {
            case "GET": {
                const { key } = ctx.query;
                if (!key) {
                    ctx.throw(400, "Set key query param to get the json");
                }
                if (!db.keyExists(key)) {
                    ctx.throw(404, "No json with such key");
                }
                try {
                    const value = await db.get(key);
                    ctx.set("Content-Type", "application/json");
                    ctx.body = value;
                } catch (e) {
                    ctx.status = 500;
                    ctx.body = "Sorry but we couldn't get your json";
                }
                return;
            }
            case "PUT": {
                const key = randomBytes(5).toString("base64url");
                const value = JSON.stringify(ctx.req.body);
                try {
                    await db.store(key, value);
                    const serverUrl = ctx.request.URL;
                    const link = `${serverUrl.protocol}//${serverUrl.host}${JSON_ROUTE}?key=${key}`;
                    ctx.body = `Saved your json in the db. Get your json <a href="${link}">here</a>`;
                } catch (e) {
                    ctx.status = 500;
                    ctx.body = "Sorry but we couldn't save your json";
                }
                return;
            }
            default:
                ctx.throw(405, "Method not allowed");
        }
    }
    ctx.throw(404, "Route not found");
});

app.listen(PORT, () => {
    console.log(`Server listens at port ${PORT}`);
});
