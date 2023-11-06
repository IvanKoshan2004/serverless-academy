import express from "express";
import { createAppRouter } from "./router.js";
import { ShortlinkService } from "./shortlink/shortlink.js";
import { parseEnv } from "./parse-env.js";

const PORT = process.env.PORT || 3000;
const MAX_BYTES_PER_LINK_TAG = 3;
parseEnv(".env");

const app = express();
const shortlinkService = new ShortlinkService({
    maxStoreBytes: MAX_BYTES_PER_LINK_TAG,
    mysqlConfig: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
});
await shortlinkService.initService();

app.use(createAppRouter(shortlinkService));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
