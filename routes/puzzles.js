const express = require("express");
const fs = require("fs");
const router = express.Router();
router.use(express.json());

// imports
const {
  makePuzzle,
  trimFileNameFromString,
} = require("../utilities/makePuzzle");

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
      const formattedStrings = [];
      files.map((string) =>
        formattedStrings.push(trimFileNameFromString(string))
      );
      res.json(formattedStrings);
    }
  });
});

router.get("/latest", (_req, res) => {
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

router.get("/:puzzleid", (req, res) => {
  const { puzzleid } = req.params;
  fs.readdir("./data/", (err, files) => {
    if (err) {
      console.error(err);
    } else {
      files.forEach((file) => {
        loadData(`./data/${file}`, (err, data) => {
          let tempdata = JSON.parse(data);
          console.log(typeof tempdata["puzzleId"]);

          if (parseInt(puzzleid) === tempdata["puzzleId"]) {
            res.status(200).json(tempdata);
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
