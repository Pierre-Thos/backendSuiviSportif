import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const measurements = req.app.locals.measurements;

    const { userId, weight, bodyFat, waist, date } = req.body;

    if (!userId || weight === undefined || weight === null) {
      return res.status(400).json({
        message: "Les champs 'userId' et 'weight' sont obligatoires.",
      });
    }

    const parsedWeight = Number(weight);
    if (Number.isNaN(parsedWeight)) {
      return res.status(400).json({
        message: "Le champ 'weight' doit être un nombre.",
      });
    }

    const doc = {
      userId,
      weight: parsedWeight,
      bodyFat: bodyFat !== undefined && bodyFat !== null ? Number(bodyFat) : null,
      waist: waist !== undefined && waist !== null ? Number(waist) : null,
      date: date ? new Date(date) : new Date(),
    };

    const result = await measurements.insertOne(doc);

    res.status(201).json({
      message: "Mesure créée avec succès",
      id: result.insertedId,
    });
  } catch (err) {
    console.error("Erreur POST /measurements :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 *Route GET avancée : filtres + pagination
 * URL : GET /measurements?userId=xxx&dateFrom=2025-01-01&dateTo=2025-12-31&page=1&limit=10
 */
router.get("/", async (req, res) => {
  try {
    const measurements = req.app.locals.measurements;

    const {
      userId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = req.query;

    const filtre = {};

    if (userId) {
      filtre.userId = userId;
    }

    if (dateFrom || dateTo) {
      filtre.date = {};
      if (dateFrom) {
        filtre.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // pour inclure toute la journée de dateTo
        const end = new Date(dateTo);
        // Si tu veux inclure toute la journée, tu peux faire :
        // end.setHours(23, 59, 59, 999);
        filtre.date.$lte = end;
      }
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const data = await measurements
      .find(filtre)
      .sort({ date: 1 }) // tri chronologique
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
    console.error("Erreur GET /measurements :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * Route d’agrégation : évolution du poids moyen par mois
 * URL : GET /measurements/stats/weight-evolution?userId=xxx
 */
router.get("/stats/weight-evolution", async (req, res) => {
  try {
    const measurements = req.app.locals.measurements;
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "Le paramètre 'userId' est obligatoire." });
    }

    const pipeline = [
      {
        $match: { userId: userId },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          avgWeight: { $avg: "$weight" },
          minWeight: { $min: "$weight" },
          maxWeight: { $max: "$weight" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          avgWeight: 1,
          minWeight: 1,
          maxWeight: 1,
          count: 1,
        },
      },
    ];

    const stats = await measurements.aggregate(pipeline).toArray();

    res.json({
      userId,
      evolution: stats,
    });
  } catch (err) {
    console.error("Erreur GET /measurements/stats/weight-evolution :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
