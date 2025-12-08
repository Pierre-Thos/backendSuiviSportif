import express from "express";
import { connect } from "./db/mongoClient.js";
import routes from "./routes/routes.js"
import seancesroutes from "./routes/seeances.routes.js"

const app = express();
app.use(express.json());

app.use("/user", routes);
app.use("/seances", seancesroutes);

// Connecte la base au démarrage
(async () => {
    const db = await connect();
    app.locals.user = db.collection("user");
    // Ma  collection perso pour le projet ( wahab )
  app.locals.seances = db.collection("seances");
})();

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});