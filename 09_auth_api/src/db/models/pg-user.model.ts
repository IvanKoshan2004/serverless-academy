import { Pool } from "pg";
import { IUserModel, User } from "../interfaces/user-model.interface";
import { UniqueColumnError } from "../../lib/errors/unique-column.error";
import { compare, hash } from "bcrypt";
import { UnauthorizedError } from "../../lib/errors/unauthorized.error";
import { EntityNotFoundError } from "../../lib/errors/entity-not-found.error";

export class PgUserModel implements IUserModel {
    private SALT_ROUNDS = 10;
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
        const userExistsQuery = await client.query(
            "SELECT id, email FROM users WHERE email = $1",
            [email]
        );
        if (userExistsQuery.rowCount != 0) {
            throw new UniqueColumnError("Email already exists");
        }
        const passwordHash = await hash(password, this.SALT_ROUNDS);
        await client.query("INSERT INTO users (email, hash) VALUES ($1, $2)", [
            email,
            passwordHash,
        ]);
        const getUserQuery = await client.query(
            "SELECT id, email FROM users WHERE email = $1",
            [email]
        );
        if (getUserQuery.rowCount == 0) {
            throw new EntityNotFoundError("User not found");
        }
        const user = getUserQuery.rows[0];
        client.release();
        return {
            id: user.id,
            email: user.email,
        };
    }
    async loginUser(email: string, password: string): Promise<User> {
        const client = await this.pool.connect();
        const userQuery = await client.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if (userQuery.rowCount == 0) {
            throw new EntityNotFoundError("User not found");
        }
        const user = userQuery.rows[0];
        if (!(await compare(password, user.hash))) {
            throw new UnauthorizedError("User not authorized");
        }
        client.release();
        return {
            id: user.id,
            email: user.email,
        };
    }
}
