import express from "express";
import { connect } from "./db/mongoClient.js";
import routes from "./routes/routes.js";
import exercicesRoutes from "./routes/routes_exercices.js";
import measurementRoutes from "./routes/route_measurement.js";
import seancesRoutes from "./routes/seances.routes.js";

const app = express();
app.use(express.json());

async function startServer() {
    const db = await connect();

    app.locals.db = {
        user: db.collection("user"),
        seance: db.collection("seance"),
        exercice: db.collection("exercice"),
        measurement: db.collection("measurement")
    };

    app.use("/", routes);
    app.use("/", exercicesRoutes);
    app.use("/", measurementRoutes);
    app.use("/", seancesRoutes);

    app.listen(3000, () => {
        console.log("Server running at http://localhost:3000");
    });
}

startServer();
