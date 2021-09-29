import * as jwt from "jsonwebtoken";

export function generateToken(payload: string | object, options?: jwt.SignOptions): string {
    return jwt.sign(payload, <string>process.env.JWT_SECRET, { ...options, algorithm: "HS384" });
}

export function verifyToken(token: string, options?: jwt.VerifyOptions): any {
    try {
        return jwt.verify(token, <string>process.env.JWT_SECRET, { ...options, algorithms: ["HS384"] });
    } catch (e) {
        return null;
    }
}
