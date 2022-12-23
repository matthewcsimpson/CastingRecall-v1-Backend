// libraries
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());

// variables
const PORT = process.env.PORT || 8080;
const puzzlerouter = require("./routes/puzzles");

// middleware
app.use((req, _res, next) => {
  let timestamp = Date.now();
  console.log(`${timestamp} incoming request at ${req.originalUrl}`);
  next();
});

app.use("/puzzle", puzzlerouter);

app.get("/", (req, res) => {
  res.writeHead(301, { Location: "http://" + req.headers["host"] + "/puzzle" });
  return res.end();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
