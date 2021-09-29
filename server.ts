//Lib
import MySql, { sessionStore } from "./lib/sql";
import express, { Request, Response, NextFunction } from "express";
import * as path from "path";
import * as jwt from "./lib/jwt";
import isAuth from "./lib/isAuth";
import session from "express-session";
import ApiRouter from "./router/api";
import ShortRouter from "./router/short";
const app = express();

//Constant Variables
const ROOT = path.join(__dirname, "public", "html");
const PORT = process.env.PORT || 3000;
export const sql = MySql(() => console.log("Connected to database"));

//Middleware
app.set("view engine", "ejs");
app.set("views", ROOT);
app.use(
    session({
        name: "isla.shortener",
        secret: <string>process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        // store: sessionStore(),
        cookie: { maxAge: 60000 * 5 },
    }),
);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(isAuth);
app.use("/api", ApiRouter);
app.use("/short", ShortRouter);
app.all("/public/*", (req, res) => {
    res.sendStatus(401);
});

app.get("/", isUserAuth(), (req, res) => {
    res.render("index", {});
});

app.get("/login", isUserAuth(true), (req, res) => {
    if ("error" in req.query) return res.render("login", { error: true });
    res.render("login");
});

app.get("/signup", isUserAuth(true), (req, res) => {
    let { error } = <any>req.query;
    let errorMsg: string[] = [];

    error = parseInt(error);
    if (error & 1) errorMsg.push("Username is already exist");
    if (error & 2) errorMsg.push("Email is already exist");

    res.render("register", { error: errorMsg });
});

app.use((req, res) => {
    res.sendStatus(404);
});

app.listen(PORT, () => console.log("Listening on port " + PORT));

//Custom Middleware
function isUserAuth(isNot?: boolean) {
    if (!isNot)
        return (req: Request, res: Response, next: NextFunction) => {
            if (!req.isAuthenticated) return res.status(401).redirect("/login");
            return next();
        };

    return (req: Request, res: Response, next: NextFunction) => {
        if (req.isAuthenticated) return res.status(401).redirect("/");
        return next();
    };
}
