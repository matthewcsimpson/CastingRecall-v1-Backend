const express = require("express");
const fs = require("fs");
const router = express.Router();
router.use(express.json());

// imports
const { makePuzzle } = require("../utilities/makePuzzle");

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
router.get("/generate", async (_req, res) => {
  await makePuzzle();
  res.send("puzzle made!");
});

/**
 * Return a list of available puzzles
 */
router.get("/list", (_req, res) => {
  fs.readdir("./data/", (err, files) => {
    if (err) {
      console.error(err);
    } else {
      res.json(files);
    }
  });
});

router.get("/:puzzleid", (req, res) => {
  const { puzzleid } = req.params;

  fs.readdir("./data/", (err, files) => {
    if (err) {
      console.error(err);
    } else {
      files.forEach((file) => {
        loadData(`./data/${file}`, (err, data) => {
          let tempdata = JSON.parse(data);
          // console.log(tempdata.puzzleId);
          if (tempdata.puzzleId === puzzleid) {
            res.json(tempdata);
          }
        });
      });
    }
  });
});

router.get("/", (_req, res) => {
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

module.exports = router;
