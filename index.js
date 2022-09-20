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

// imports
const { makePuzzle } = require("./makePuzzle");

/**
 * Function to read the INVENTORY JSON file.
 * @param {function} callback
 */
function loadData(location, callback) {
  fs.readFile(location, "utf8", callback);
}

/**
 * Generate a new puzzle.
 */
app.get("/generatepuzzle", async (_req, res) => {
  await makePuzzle();
  res.send("puzzle made!");
});

/**
 * Return a list of available puzzles
 */
app.get("/puzzlelist", (_req, res) => {
  fs.readdir("./data/", (err, files) => {
    if (err) {
      console.error(err);
    } else {
      res.json(files);
    }
  });
});

app.get("/puzzle", (_req, res) => {
  fs.readdir("./data/", (err, files) => {
    if (err) {
      console.error(err);
    } else {
      loadData(`./data/${files[files.length - 1]}`, (err, data) => {
        if (err) {
          console.error(err);
        } else {
          const puzzle = JSON.parse(data);
          res.status(200).json(puzzle);
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
