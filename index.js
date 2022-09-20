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

const { makePuzzle } = require("./makePuzzle");

/**
 * Generate a new puzzle.
 */
app.get("/generatepuzzle", async (_req, res) => {
  const puzzle = await makePuzzle();
  res.json(puzzle);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
