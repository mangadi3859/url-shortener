import { Router } from "express";
import { verifyToken } from "../lib/jwt";
import { sql } from "../server";
import { generateToken } from "../lib/jwt";
import { randomBytes } from "crypto";
const router = Router();

router.get("/", (req, res) => {
    res.send({ message: "This is a REST API" });
});

router.get("/users", async (req, res) => {
    let users = await sql.exec("SELECT id, username, email FROM users;");

    res.send(users[0]);
});

router.get("/shorts", async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);
    let query = `
    SELECT * FROM short
    WHERE creator_id IN (SELECT id FROM users WHERE id = creator_id);
    `;
    let shorts = await sql.exec(query);

    res.json(shorts[0]);
});

router.post("/create", async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);
    const { url } = req.body;
    if (!url) return res.sendStatus(400);
    let genId = randomBytes(Math.round(Math.random() * (7 - 5)) + 5)
        .toString("base64")
        .replace(/[^\w\d_-]/g, "");
    let user = verifyToken(req.session["token"]);

    let query = `
    INSERT INTO short (id, url, creator_id)
    VALUES ('${genId}', '${url}', ${user.id});
    `;
    await sql.query(query);

    res.status(201).redirect("/");
});

router.post("/register", async (req, res) => {
    if (req.isAuthenticated) return res.sendStatus(403);
    let { username, email, password } = req.body;
    if (!username || !email || !password) return res.sendStatus(400);
    let db = (await sql.exec<{ username: string; email: string; password: string }>(`SELECT * FROM users;`))[0];

    let err = 0;
    if (db.some((e) => e.username.toLowerCase() === username.toLowerCase())) err++;
    if (db.some((e) => e.email.toLowerCase() === email.toLowerCase())) err += 2;

    if (err) {
        return res.status(404).redirect("/signup?error=" + err);
    }

    let insertQuery = `
    INSERT INTO users (email, username, password)
    VALUES ('${email}', '${username}', '${password}');
    `;
    await sql.query(insertQuery);
    res.status(201).redirect("/login");
});

router.post("/login", async (req, res) => {
    if (req.isAuthenticated) return res.sendStatus(403);
    let { username, password } = req.body;
    if (!username || !password) return res.sendStatus(400);
    let db = (await sql.exec<{ username: string; email: string; password: string; id: number }>(`SELECT * FROM users;`))[0];
    let user = db.find((u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (!user) {
        return res.status(401).redirect("/login?error=1");
    }

    req.session["token"] = generateToken({ username, password, id: user.id }, { expiresIn: "5m" });
    res.status(203).redirect("/");
});

router.delete("/logout", async (req, res) => {
    if (!req.isAuthenticated) return res.status(401).json({ error: 401 });
    let { username, password, id } = verifyToken(req.session["token"]);
    if (!username || !id) return res.status(400).json({ error: 400 });
    let db = (await sql.exec<{ username: string; email: string; password: string; id: number }>(`SELECT * FROM users;`))[0];
    let user = db.find((u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password && u.password === password);

    if (!user) {
        res.status(404).json({ error: 404 });
    }

    delete req.session["token"];
    res.status(200).json({ code: 200, message: "ok" });
});

export default router;
