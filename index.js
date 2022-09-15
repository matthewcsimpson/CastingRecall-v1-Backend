// libraries
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const app = express();
const fs = require("fs");

app.use(express.json());
app.use(cors());

// variables
const PORT = process.env.SERVER_PORT;
const API_KEY = process.env.TMDB_API_KEY;
const TMDB_SEARCH_POP_URL = process.env.TMDB_SEARCH_POP_URL;
const TMDB_SEARCH_CREDITS_FRONT = process.env.TMDB_SEARCH_CREDITS_FRONT;
const TMBD_SEARCH_CREDITS_BACK = process.env.TMBD_SEARCH_CREDITS_BACK;

const LOWEST_YEAR = 1990;
const CURRENT_YEAR = new Date().getFullYear();

/**
 * Function to read the WAREHOUSE JSON file.
 * @param {function} callback
 */
function loadData(callback) {
  fs.readFile("./data/movies.json", "utf8", callback);
}

/**
 * Function to overwrite the warehouses JSON file
 * @param {stringify json} data
 */
function saveData(data) {
  fs.writeFile(`./data/movies.json`, data, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

/**
 * Function to generate a puzzle.
 */
const makePuzzle = () => {
  // const hold the puzzle
  const puzzleArray = [];

  // generate a random year
  const randomYear = Math.floor(
    Math.random() * (CURRENT_YEAR - LOWEST_YEAR) + LOWEST_YEAR
  );

  // generate a random number
  const randomPick = Math.floor(Math.random() * 10);

  const firstMovie = axios
    .get(`${TMDB_SEARCH_POP_URL}${randomYear}&api_key=${API_KEY}`)
    .then((res) => {
      res.data.results.find((movie, i) => {
        if (i === randomPick) {
          return movie;
        }
      });
    })
    .catch((e) => console.error(e));

  console.log(firstMovie);
  console.log(firstMovie);
  console.log(firstMovie);
};

app.get("/generatepuzzle", (req, res) => {
  makePuzzle();
  res.send("i'm here");
  // loadData((err, data) => {
  //   if (err) {
  //     console.error(e);
  //   } else {
  //     res.json(JSON.parse(data));
  //   }
  // });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
