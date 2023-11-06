import express from "express";
import { createAppRouter } from "./router.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(createAppRouter());

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
