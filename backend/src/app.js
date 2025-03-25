const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/api", taskRoutes);

app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}`);
});
