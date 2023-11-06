import express from "express";
import { createAppRouter } from "./router.js";
import { ShortlinkService } from "./shortlink/shortlink.js";

const PORT = process.env.PORT || 3000;
const MAX_BYTES_PER_LINK_TAG = 3;

const app = express();
const shortlinkService = new ShortlinkService({
    maxStoreBytes: MAX_BYTES_PER_LINK_TAG,
    mysqlConfig: {
        host: "localhost",
        user: "root",
        password: "root",
        database: "shortlink",
    },
});
app.use(createAppRouter(shortlinkService));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
