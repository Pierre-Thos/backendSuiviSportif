import express from "express";
import { connect } from "./db/mongoClient.js";
import routes from "./routes/routes.js"
const app = express();
app.use(express.json());

app.use("/user", routes);

// Connecte la base au démarrage
(async () => {
    const db = await connect();
    app.locals.user = db.collection("user");
})();

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});