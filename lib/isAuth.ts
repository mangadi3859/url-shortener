import { Request, Response, NextFunction } from "express";
import { sql } from "../server";
import { verifyToken } from "./jwt";

export default async (request: Request, response: Response, next: NextFunction) => {
    const token = request.session["token"];
    if (!token?.trim()) {
        request.isAuthenticated = false;
        return next();
    }

    const payloadData: { password: string; username: string } = verifyToken(token);
    if (!payloadData) {
        request.isAuthenticated = false;
        return next();
    }

    let query = `
    SELECT id FROM users
    WHERE users.username = '${payloadData.username}' AND users.password = '${payloadData.password}'
    LIMIT 1;`;
    let db = await sql.exec(query);

    if (!db[0].length) {
        request.isAuthenticated = false;
        return next();
    }

    request.isAuthenticated = true;
    return next();
};

declare global {
    namespace Express {
        interface Request {
            isAuthenticated: boolean;
            query: any;
            body: any;
        }
    }
}
