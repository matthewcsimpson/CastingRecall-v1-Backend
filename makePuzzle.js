// libraries
const axios = require("axios");
require("dotenv").config();

// variables
const API_KEY = process.env.TMDB_API_KEY;
const TMDB_SEARCH_POP_URL = process.env.TMDB_SEARCH_POP_URL;
const TMDB_SEARCH_CREDITS_FRONT = process.env.TMDB_SEARCH_CREDITS_FRONT;
const TMBD_SEARCH_CREDITS_BACK = process.env.TMBD_SEARCH_CREDITS_BACK;
const TMDB_DISCOVER_MOVIE_BY_ACTOR = process.env.TMDB_DISCOVER_MOVIE_BY_ACTOR;

const LOWEST_YEAR = 1990;
const CURRENT_YEAR = new Date().getFullYear();

/**
 * Function to generate a puzzle.
 */
const makePuzzle = async () => {
  // const hold the puzzle
  const movieArray = new Array(6).fill(null);
  let actorArray = [];

  // generate a random year
  const randomYear = Math.floor(
    Math.random() * (CURRENT_YEAR - LOWEST_YEAR) + LOWEST_YEAR
  );

  // generate a random number
  const randomPick = Math.floor(Math.random() * 10);

  // randomly get one of the most popular movies of a random year.
  const keyMovie = await axios
    .get(`${TMDB_SEARCH_POP_URL}${randomYear}&api_key=${API_KEY}`)
    .then((res) => {
      return res.data.results.find((movie, i) => {
        if (i === randomPick) {
          return movie;
        }
      });
    })
    .catch((e) => console.error(e));
  // console.info(keyMovie);
  movieArray[0] = keyMovie.id;

  // get the first five actors
  const firstFiveActors = await getFiveActors(keyMovie.id);
  actorArray = [actorArray, ...firstFiveActors];

  // get the next movies
  for (let i = 1; i < movieArray.length; i++) {
    const randomActor = await getRandomActor(actorArray);
    console.log(randomActor);
    // const fiveMovies = await getMovieByActorID(randomActor.id);
  }

  const newPuzzle = { movies: movieArray, actors: actorArray };
  return newPuzzle;
};

/**
 * Get five movies from one actor
 * @param {string} id
 * @returns
 */
const getFiveActors = async (id) => {
  let tempArray = [];
  await axios
    .get(
      `${TMDB_SEARCH_CREDITS_FRONT}${id}${TMBD_SEARCH_CREDITS_BACK}?api_key=${API_KEY}`
    )
    .then((res) => {
      res.data.cast.forEach((actor, i) => {
        if (actor.order < 5) {
          tempArray.push(actor);
        }
      });
    })
    .catch((e) => {
      console.error(e);
    });
  return tempArray;
};

const getRandomActor = async (array) => {
  let temp = "";
  console.log(array.length);
  const randomPick = Math.floor(Math.random() * array.length);
  console.log(randomPick);
  const randomActor = array.find((actor, i) => {
    if (actor && i === randomPick) {
      // console.log("actor " + actor.name);
      temp = actor;
    }
  });
  return temp;
};

const getMovieByActorID = async (actorId) => {
  const randomPick = Math.floor(Math.random() * 10);
  let movieId = "";
  await axios
    .get(`${TMDB_DISCOVER_MOVIE_BY_ACTOR}${actorId}&=api_key=${API_KEY}`)
    .then((res) => {
      console.log(res.data);
    });
};

module.exports = { makePuzzle };
