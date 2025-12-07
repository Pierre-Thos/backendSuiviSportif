import express from "express";
import { Router } from "express";
const router = Router();
const app = express();
app.use(express.json());

let user;

//Route pour récuperer un utilisateur
router.get("/", async (req, res) => {
    const user = req.app.locals.user;
    const list = await user.find().toArray();
    res.json(list);
});

// Route POST pour insérer un utilisateur
router.post("/", async (req, res) => {
    const user = req.app.locals.user;
    const doc = req.body;
    const result = await user.insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
});

export default router;