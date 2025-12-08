import express from "express";
import { Router } from "express";

const router = Router();


//  Ajouter un exercice

router.post("/", async (req, res) => {
    try {
        const exercises = req.app.locals.exercises;   // collection
        const doc = req.body;

        const result = await exercises.insertOne(doc);
        res.status(201).json({ ...doc, _id: result.insertedId });

    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});



//  Liste filtrée + pagination

router.get("/", async (req, res) => {
    try {
        const exercises = req.app.locals.exercises;

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



//   Aggregation + lookup avec WorkoutSession

router.get("/stats/top-muscle-groups", async (req, res) => {
    try {
        const exercises = req.app.locals.exercises;
        const session = req.app.locals.workoutSessions;

        const pipeline = [
          
            // Jointure entre WorkoutSession.exercisesIds et Exercises._id
            {
                $lookup: {
                    from: "workoutSessions",
                    localField: "_id",
                    foreignField: "exercisesIds",
                    as: "usedInSessions"
                }
            },
            // Filtrer uniquement les exercices utilisés
            { $match: { usedInSessions: { $ne: [] } } },

            // Regrouper par muscleGroup
            {
                $group: {
                    _id: "$muscleGroup",
                    usageCount: { $sum: 1 }
                }
            },

            // Trier les groupes musculaires les plus utilisés
            { $sort: { usageCount: -1 } }
        ];

        const stats = await exercises.aggregate(pipeline).toArray();
        res.json(stats);

    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});


export default router;
