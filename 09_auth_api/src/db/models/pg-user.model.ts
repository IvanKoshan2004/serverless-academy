import { Pool } from "pg";
import { IUserModel, User } from "../interfaces/user-model.interface";

export class PgUserModel implements IUserModel {
    constructor(private pool: Pool) {}
    async getUser(id: number): Promise<User | null> {
        const client = await this.pool.connect();
        const queryResult = client.query("SELECT * FROM users WHERE id = $1", [
            id,
        ]);
        console.log(queryResult);
        client.release();
        return null;
    }
    async registerUser(email: string, password: string): Promise<User> {
        const client = await this.pool.connect();
        const queryResult = client.query(
            "INSERT INTO users (email, hash) VALUES ($1, $2)",
            [email, password]
        );
        console.log(queryResult);
        client.release();
        return {
            id: 1,
            email: "email",
        };
    }
    async loginUser(email: string, password: string): Promise<boolean> {
        const client = await this.pool.connect();
        const queryResult = client.query(
            "SELECT * FROM users WHERE email = $1 and hash = $2",
            [email, password]
        );
        console.log(queryResult);
        client.release();
        return true;
    }
}
