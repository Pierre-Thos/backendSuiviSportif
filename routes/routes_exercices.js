import { Router } from "express"; 
const router = Router();

//  Ajouter un exercice
router.post("/exercice", async (req, res) => {
    try {
        const exercises = req.app.locals.db.exercice;   // collection
        const doc = req.body;

        const result = await exercises.insertOne(doc);
        res.status(201).json({ ...doc, _id: result.insertedId });

    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

//  Liste filtrée + pagination
router.get("/exercice", async (req, res) => {
    try {
        const exercises = req.app.locals.db.exercice;

        const {
            muscleGroup,
            type,
            difficultyMin,
            page = 1,
            limit = 10
        } = req.query;

        const query = {};

        if (muscleGroup) query.muscleGroup = muscleGroup;
        if (type) query.type = type;
        if (difficultyMin) query.difficulty = { $gte: Number(difficultyMin) };

        const skip = (Number(page) - 1) * Number(limit);

        const list = await exercises
            .find(query)
            .skip(skip)
            .limit(Number(limit))
            .toArray();

        res.json(list);

    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get("/exercice/stats/top-muscle-groups", async (req, res) => {
    try {
        const exercises = req.app.locals.db.exercice;

        const pipeline = [
            {
                $group: {
                    _id: "$muscleGroup",
                    count: { $sum: 1 }   // Compte le nombre d'exercices par groupe musculaire
                }
            },
            { $sort: { count: -1 } }  // Trie par nombre décroissant
        ];

        const stats = await exercises.aggregate(pipeline).toArray();
        res.json(stats);

    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

export default router;
