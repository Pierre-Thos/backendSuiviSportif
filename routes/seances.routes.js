import { Router } from "express";

const router = Router();
router.get("/seance/stats", async (req, res) => {
  try {
    const seances = req.app.locals.db.seance;

    const stats = await seances.aggregate([
      {
        $match: {
          type: { $exists: true, $ne: null },
          duree: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $addFields: {
          dureeParsed: {
            $cond: [
              { $in: [{ $type: "$duree" }, ["int", "long", "double"]] },
              "$duree",
              {
                $cond: [
                  { $eq: [{ $type: "$duree" }, "string"] },
                  { $toDouble: "$duree" },
                  null
                ]
              }
            ]
          }
        }
      },
      {
        $match: {
          dureeParsed: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$type",
          nbSeances: { $sum: 1 },
          dureeTotale: { $sum: "$dureeParsed" },
          dureeMoyenne: { $avg: "$dureeParsed" }
        }
      },
      { $sort: { dureeTotale: -1 } }
    ]).toArray();

    res.json(stats);
  } catch (err) {
    console.error("Erreur GET /seance/stats :", err);
    res.status(500).json({
      error: "Aggregation failed",
      details: String(err)
    });
  }
});


export default router;
