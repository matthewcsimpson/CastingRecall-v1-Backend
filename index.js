// libraries
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const fs = require("fs");

app.use(express.json());
app.use(cors());

// variables
const PORT = process.env.SERVER_PORT;
const puzzlerouter = require("./routes/puzzles");
const dateOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

// middleware
app.use((req, _res, next) => {
  let now = Date.now();
  console.log(`${now.toLocaleString()} incoming request at ${req.originalUrl}`);
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
