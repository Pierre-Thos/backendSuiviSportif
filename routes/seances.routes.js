import express from "express";

const router = express.Router();

/**
 * 1️⃣ Route POST : créer une séance
 * URL : POST /seances
 * Body JSON :
 * {
 *   "type": "course",
 *   "duree": 40,
 *   "intensite": "moyenne",
 *   "calories": 450,
 *   "date": "2025-12-08T10:00:00.000Z"  // optionnel
 * }
 */
router.post("/", async (req, res) => {
  try {
    const seances = req.app.locals.seances;

    const { type, duree, intensite, calories, date } = req.body;

    if (!type || !duree) {
      return res
        .status(400)
        .json({ message: "Les champs 'type' et 'duree' sont obligatoires." });
    }

    const result = await seances.insertOne({
      type,
      duree: Number(duree),
      intensite: intensite || null,
      calories: calories ? Number(calories) : null,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      message: "Séance créée avec succès",
      id: result.insertedId,
    });
  } catch (err) {
    console.error("Erreur POST /seances :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * 2️⃣ Route GET avancée : filtres + pagination
 * URL : GET /seances?type=course&minDuree=30&page=1&limit=10
 */
router.get("/", async (req, res) => {
  try {
    const seances = req.app.locals.seances;

    const { type, minDuree, page = 1, limit = 10 } = req.query;

    const filtre = {};
    if (type) filtre.type = type;
    if (minDuree) filtre.duree = { $gte: Number(minDuree) };

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const data = await seances
      .find(filtre)
      .skip(skip)
      .limit(limitNumber)
      .toArray();

    res.json({
      page: pageNumber,
      limit: limitNumber,
      count: data.length,
      results: data,
    });
  } catch (err) {
    console.error("Erreur GET /seances :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * 3️⃣ Route d’agrégation : stats par type d’activité
 * URL : GET /seances/stats
 */
router.get("/stats", async (req, res) => {
  try {
    const seances = req.app.locals.seances;

    const stats = await seances
      .aggregate([
        {
          $group: {
            _id: "$type",
            nbSeances: { $sum: 1 },
            dureeTotale: { $sum: "$duree" },
            dureeMoyenne: { $avg: "$duree" },
          },
        },
        { $sort: { dureeTotale: -1 } },
      ])
      .toArray();

    res.json(stats);
  } catch (err) {
    console.error("Erreur GET /seances/stats :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
