import { Router, json } from "express";
import { createRedirectController } from "./controllers/redirect.controller.js";
import { createShortlinkUrlController } from "./controllers/shortlink-url.controller.js";

export function createAppRouter(shortlinkService) {
    const router = Router();
    router.post(
        "/shortlink",
        json(),
        createShortlinkUrlController(shortlinkService)
    );
    router.use("/:linkTag", createRedirectController(shortlinkService));
    return router;
}
