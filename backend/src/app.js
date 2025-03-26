const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Body:", req.body);
  next();
});

app.use(
  cors({
    origin: "http://localhost:5173", // ou le port de votre application frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", taskRoutes);

mongoose
  .connect("mongodb://localhost:27017/local", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie"))
  .catch((err) => console.error("Erreur de connexion à MongoDB:", err));

app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}`);
});
