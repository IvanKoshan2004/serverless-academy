import express from "express";
import authRouter from "./routers/auth.router";
import meRouter from "./routers/me.router";
import { parseEnv } from "./parse-env";

parseEnv("../.env");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/auth", authRouter);
app.use("/me", meRouter);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
