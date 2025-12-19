import { Router } from "express";
import { ObjectId } from "mongodb";

//Dependencies de l'import/export JSON
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Route pour récuperer un utilisateur
router.get("/user", async (req, res) => {
    const user = req.app.locals.db.user;
    const list = await user.find().toArray();
    res.json(list);
});

// Route POST pour insérer un utilisateur
router.post("/user", async (req, res) => {
    const user = req.app.locals.db.user;
    const doc = req.body;
    const result = await user.insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
});

//Route d'aggrégation pour calculer le poids total d'une séance
router.get("/seance/stats/poids-total", async (req, res) => {
    try {
        const seance = req.app.locals.db.seance;

        const stats = await seance.aggregate([
            { $unwind: "$exercices" },
            {
                $addFields: {
                    poidsExercice: {
                        $multiply: [
                            "$exercices.reps",
                            "$exercices.series",
                            "$exercices.charge"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    date: { $first: "$date" },
                    userId: { $first: "$userId" },
                    totalPoids: { $sum: "$poidsExercice" }
                }
            },
            { $sort: { totalPoids: -1 } }
        ]).toArray();

        //Export JSON
        const exportPath = path.join(__dirname, "../data/stats_poids_total.json");
        fs.writeFileSync(exportPath, JSON.stringify(stats, null, 2));

        res.json({
            message: "Export JSON crée",
            file: "data/stats_poids_total.json",
            stats
        });
    } catch (err) {
        res.status(500).json({ error: "Erreur durant agrégation/export" });
    }
});

//Route pour inserer un fichier JSON dans Atlas
router.post("/import/json", async (req, res) => {
    try {
        const db = req.app.locals.db;

        const { fileName, collectionName } = req.body;

        if (!fileName || !collectionName) {
            return res.status(400).json({ error: "fileName & collectionName requis" });
        }

        //Verifier que la collection existe dans app.locals
        const collection = db[collectionName];
        if (!collection) {
            return res.status(400).json({ error: `Collection '${collectionName}' inconnue` });
        }

        //Recupere le path
        const filePath = path.join(process.cwd(), "data", fileName);
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

        //Verifie si data est bien un tableau 
        const docs = Array.isArray(data) ? data : [data];

        //Insere le JSON dans Atlas
        const result = await collection.insertMany(docs);

        res.json({
            message: "Import JSON vers Atlas réussi",
            inserted: result.insertedCount,
            collection: collectionName
        });

    } catch (err) {
    console.error("Erreur import JSON vers Atlas :", err);
    res.status(500).json({ error: err.message || "Erreur durant l'import JSON" });
}
});

// ----------------------
// Séances (seance)
// ----------------------

// Route POST pour insérer une séance
router.post("/seance", async (req, res) => {
    try {
        const seance = req.app.locals.db.seance;
        const doc = req.body;
        const result = await seance.insertOne(doc);
        res.status(201).json({ ...doc, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: "Insertion failed" });
    }
});

// Route GET pour récupérer une séance par id
router.get("/seance/:id", async (req, res) => {
    try {
        const oid = new ObjectId(req.params.id);
        const seance = req.app.locals.db.seance;
        const doc = await seance.findOne({ _id: oid });
        if (!doc) return res.status(404).json({ error: "Session not found" });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

export default router;
