import { Router } from "express";
import { sql } from "../server";
const router = Router();

router.get("/", (req, res) => {
    res.redirect("/");
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    let db: any[] = (await sql.exec(`SELECT * FROM short WHERE id = '${id}' LIMIT 1`))[0];
    if (!db.length) return res.sendStatus(404);

    await sql.query(`
    UPDATE short
    SET views = ${db[0].views + 1}
    WHERE id = '${id}';
    `);

    res.status(200).redirect(db[0].url);
});

export default router;
