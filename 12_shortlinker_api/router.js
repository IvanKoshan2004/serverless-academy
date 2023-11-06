import { Router, json } from "express";
import { createRedirectController } from "./controllers/redirect.controller.js";
import { createShortlinkUrlController } from "./controllers/shortlink-url.controller.js";
export function createAppRouter() {
    const router = Router();
    router.post("/shortlink", json(), createShortlinkUrlController());
    router.use("/:linkTag", createRedirectController());
    return router;
}
