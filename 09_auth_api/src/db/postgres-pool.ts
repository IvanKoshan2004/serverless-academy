import { Pool } from "pg";
import { parseEnv } from "../parse-env";

parseEnv(".env");

const pgPool = new Pool({
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT!),
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
});

export default pgPool;
