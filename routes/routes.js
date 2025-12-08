import express from "express";
import { Router } from "express";
const router = Router();
const app = express();
app.use(express.json());

//Dependencies de l'import/export JSON
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let user;

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
        const db = req.app.locals.db.seance;
        const seance = db.collection("seance");

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
        console.error(err);
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
        console.error(err);
        res.status(500).json({ error: "Erreur import JSON vers Atlas", details: err.message });
    }
});


export default router;