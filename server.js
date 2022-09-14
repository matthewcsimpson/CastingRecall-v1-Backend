// libraries
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());

// variables
const PORT = process.env.SERVER_PORT;
const API_KEY = process.env.TMDB_API_KEY;
const TMDB_SEARCH_POP_URL = process.env.TMDB_SEARCH_POP_URL;

const LOWEST_YEAR = 1990;
const CURRENT_YEAR = new Date().getFullYear();

const makePuzzle = () => {
  const randomYear = Math.floor(
    Math.random() * (CURRENT_YEAR - LOWEST_YEAR) + LOWEST_YEAR
  );

  axios
    .get(`${TMDB_SEARCH_POP_URL}${randomYear}&api_key=${API_KEY}`)
    .then((res) => {
      console.log(res.data.results);
    })
    .catch((e) => console.error(e));
};

app.get("/puzzle", (req, res) => {
  makePuzzle();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
