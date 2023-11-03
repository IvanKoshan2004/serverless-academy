import express from "express";
import { createAuthRouter } from "./routers/auth.router";
import { createMeRouter } from "./routers/me.router";
import { parseEnv } from "./parse-env";
import pgPool from "./db/postgres-pool";
import { PgUserModel } from "./db/models/pg-user.model";

parseEnv("../.env");

const app = express();
const PORT = process.env.PORT || 3000;
const userModel = new PgUserModel(pgPool);

app.use(express.json());
app.use("/auth", createAuthRouter(userModel));
app.use("/me", createMeRouter(userModel));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
