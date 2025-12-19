import { Router } from "express";
import { ObjectId } from "mongodb";

const router = Router();

// ----------------------
// POST /measurement
// Ajouter une ou plusieurs mesures physiques
// ----------------------
router.post("/measurement", async (req, res) => {
  try {
    const measurements = req.app.locals.db.measurement;

    const data = Array.isArray(req.body) ? req.body : [req.body];

    const docs = data.map(({ userId, weight, bodyFat, waist, date }) => {
      if (!userId || weight === undefined || weight === null) {
        throw new Error("userId et weight sont obligatoires");
      }

      return {
        userId,
        weight: Number(weight),
        bodyFat: bodyFat != null ? Number(bodyFat) : null,
        waist: waist != null ? Number(waist) : null,
        date: date ? new Date(date) : new Date(),
      };
    });

    const result = await measurements.insertMany(docs);

    return res.status(201).json({
      inserted: result.insertedCount,
      ids: result.insertedIds,
    });
  } catch (err) {
    console.error("Erreur POST /measurement", err);
    return res
      .status(500)
      .json({ error: "Insertion failed", details: String(err.message) });
  }
});

// ----------------------
// GET /measurement
// Liste avec filtres + pagination
// ----------------------
router.get("/measurement", async (req, res) => {
  try {
    const measurements = req.app.locals.db.measurement;

    const { userId, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

    const filtre = {};
    if (userId) filtre.userId = userId;
    if (dateFrom || dateTo) {
      filtre.date = {};
      if (dateFrom) filtre.date.$gte = new Date(dateFrom);
      if (dateTo) filtre.date.$lte = new Date(dateTo);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const list = await measurements
      .find(filtre)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limitNumber)
      .toArray();

    return res.json({
      page: pageNumber,
      limit: limitNumber,
      count: list.length,
      results: list,
    });
  } catch (err) {
    console.error("Erreur GET /measurement", err);
    return res
      .status(500)
      .json({ error: "Fetch failed", details: String(err) });
  }
});

// ----------------------
// GET /measurement/:id
// Récupérer une mesure par id
// ----------------------
router.get("/measurement/:id", async (req, res) => {
  try {
    const oid = new ObjectId(req.params.id);

    const measurements = req.app.locals.db.measurement;
    const doc = await measurements.findOne({ _id: oid });

    if (!doc) return res.status(404).json({ error: "Measurement not found" });
    return res.json(doc);
  } catch (err) {
    console.error("Erreur GET /measurement/:id", err);
    return res
      .status(500)
      .json({ error: "Fetch failed", details: String(err) });
  }
});

// ----------------------
// GET /measurement/stats/weight-evolution
// Stats de poids moyen par mois (tous utilisateurs)
// ----------------------
router.get("/measurement/stats/weight-evolution", async (req, res) => {
  try {
    const measurements = req.app.locals.db.measurement;

    const stats = await measurements
      .aggregate([
        {
          $addFields: {
            dateParsed: {
              $cond: [
                { $eq: [{ $type: "$date" }, "date"] },
                "$date",
                { $toDate: "$date" }
              ]
            }
          }
        },
        {
          $match: {
            dateParsed: { $ne: null }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$dateParsed" },
              month: { $month: "$dateParsed" }
            },
            avgWeight: { $avg: "$weight" },
            minWeight: { $min: "$weight" },
            maxWeight: { $max: "$weight" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            avgWeight: 1,
            minWeight: 1,
            maxWeight: 1,
            count: 1
          }
        }
      ])
      .toArray();

    return res.json({ evolution: stats });
  } catch (err) {
    console.error("Erreur GET /measurement/stats/weight-evolution", err);
    return res
      .status(500)
      .json({ error: "Aggregation failed", details: String(err) });
  }
});


export default router;
