import { Router } from "express";
import { ObjectId } from "mongodb";
import { connect } from "../db/mongoClient.js";

const router = Router();

// ----------------------
// Helper : collection measurement
// ----------------------
async function getMeasurementCollection(req) {
  if (!req.app.locals.measurement) {
    const db = await connect();
    req.app.locals.measurement = db.collection("measurement");
  }
  return req.app.locals.measurement;
}

// ----------------------
// POST /measurement
// Ajouter une mesure physique
// ----------------------
router.post("/measurement", async (req, res) => {
  try {
    const measurements = await getMeasurementCollection(req);
    const { userId, weight, bodyFat, waist, date } = req.body;

    if (!userId || weight === undefined || weight === null) {
      return res
        .status(400)
        .json({ error: "userId et weight sont obligatoires" });
    }

    const doc = {
      userId,
      weight: Number(weight),
      bodyFat:
        bodyFat !== undefined && bodyFat !== null ? Number(bodyFat) : null,
      waist: waist !== undefined && waist !== null ? Number(waist) : null,
      date: date ? new Date(date) : new Date(),
    };

    const result = await measurements.insertOne(doc);
    return res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    console.error("Erreur POST /measurement", err);
    return res
      .status(500)
      .json({ error: "Insertion failed", details: String(err) });
  }
});

// ----------------------
// GET /measurement
// Liste avec filtres + pagination
// /measurement?userId=xxx&dateFrom=2025-01-01&dateTo=2025-12-31&page=1&limit=10
// ----------------------
router.get("/measurement", async (req, res) => {
  try {
    const measurements = await getMeasurementCollection(req);

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
      if (dateFrom) filtre.date.$gte = new Date(dateFrom);
      if (dateTo) filtre.date.$lte = new Date(dateTo);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const cursor = measurements
      .find(filtre)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limitNumber);

    const list = await cursor.toArray();

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
    let oid;
    try {
      oid = new ObjectId(req.params.id);
    } catch (_) {
      return res.status(400).json({ error: "Invalid measurement id" });
    }

    const measurements = await getMeasurementCollection(req);
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
// Stats de poids moyen par mois pour un user
// /measurement/stats/weight-evolution?userId=xxx
// ----------------------
router.get("/measurement/stats/weight-evolution", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ error: "userId est obligatoire" });
    }

    const measurements = await getMeasurementCollection(req);

    const stats = await measurements
      .aggregate([
        { $match: { userId } },
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
        { $sort: { "_id.year": 1, "_id.month": 1 } },
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
      ])
      .toArray();

    return res.json({ userId, evolution: stats });
  } catch (err) {
    console.error(
      "Erreur GET /measurement/stats/weight-evolution",
      err
    );
    return res
      .status(500)
      .json({ error: "Aggregation failed", details: String(err) });
  }
});

export default router;
