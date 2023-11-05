import Koa from "koa";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { DBCore } from "./key-value-db.js";

const PORT = process.env.PORT || 3000;
const JSON_ROUTE = "/json";
const DB_FOLDER_NAME = "db_data";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const dbFolderPath = resolve(__dirname, DB_FOLDER_NAME);

const app = new Koa();
const db = new DBCore(dbFolderPath);
await db.initDb();

app.use((ctx) => {
    if (ctx.path == JSON_ROUTE) {
        switch (ctx.method) {
            case "GET":
                ctx.body = { hello: new Date() };
                break;
            case "PUT":
                ctx.body = { status: true, message: "saved json with id 1" };
                break;
            default:
                ctx.throw(405, "Method not allowed");
                break;
        }
        return;
    }
    ctx.throw(404, "Route not found");
});

app.listen(PORT, () => {
    console.log(`Server listens at port ${PORT}`);
});