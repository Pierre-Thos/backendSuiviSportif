import express from "express";
import { connect } from "./db/mongoClient.js";
const app = express();
app.use(express.json());

let user;

app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});

// Connecte la base au démarrage
app.locals.start = (async () => {
    const db = await connect();
    user = db.collection("user");
})();