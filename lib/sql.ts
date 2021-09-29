import * as mySql from "mysql2";
import { config } from "dotenv";
import MySqlSessionStore from "connect-mssql-v2";
import { EventEmitter } from "events";
config();

const mySqlOptions: mySql.PoolOptions = {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
};

export default (fn?: () => any) => {
    const pool = mySql.createPool(mySqlOptions).promise();
    if (fn) fn();

    return {
        ...pool,
        query: pool.query,
        async exec<T>(query: string): Promise<[T[], T[]]> {
            return <any>pool.execute(query);
        },
    };
};

export const sessionStore = () =>
    new MySqlSessionStore({
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_HOST,
    });
