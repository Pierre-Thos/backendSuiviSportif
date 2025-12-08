import express from "express";
import { Router } from "express";
import { ObjectId } from "mongodb";
import { connect } from "../db/mongoClient.js";
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

// ----------------------
// Séances (Sessions)
// ----------------------

// Helper: obtenir/initialiser la collection `session` sur app.locals
async function getSessionCollection(req) {
  if (!req.app.locals.session) {
    const db = await connect();
    req.app.locals.session = db.collection("session");
  }
  return req.app.locals.session;
}

// Route POST pour insérer une séance
router.post("/session", async (req, res) => {
  try {
    const sessions = await getSessionCollection(req);
    const doc = req.body;
    const result = await sessions.insertOne(doc);
    return res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Insertion failed", details: String(err) });
  }
});

// Route GET pour récupérer une séance par id
router.get("/session/:id", async (req, res) => {
  try {
    let oid;
    try {
      oid = new ObjectId(req.params.id);
    } catch (_) {
      return res.status(400).json({ error: "Invalid session id" });
    }

    const sessions = await getSessionCollection(req);
    const doc = await sessions.findOne({ _id: oid });
    if (!doc) return res.status(404).json({ error: "Session not found" });
    return res.json(doc);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Fetch failed", details: String(err) });
  }
});
