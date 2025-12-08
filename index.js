import express from "express";
import { connect } from "./db/mongoClient.js";
import routes from "./routes/routes.js"
const app = express();
app.use(express.json());

app.use("/", routes);

// Connecte la base au démarrage
(async () => {
    const db = await connect();
    app.locals.db = {
        user: db.collection("user"),
        seance: db.collection("seance"),
        exercice: db.collection("exercice")
    };
})();

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});