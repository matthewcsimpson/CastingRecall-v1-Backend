// libraries
const axios = require("axios");
const e = require("cors");
require("dotenv").config();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// variables
const API_KEY = process.env.TMDB_API_KEY;
const TMDB_DISCOVER_MOVIE_BY_YEAR_SORT_REV =
  process.env.TMDB_DISCOVER_MOVIE_BY_YEAR_SORT_REV;
const TMDB_SEARCH_POP_URL = process.env.TMDB_SEARCH_POP_URL;
const TMDB_SEARCH_CREDITS_FRONT = process.env.TMDB_SEARCH_CREDITS_FRONT;
const TMBD_SEARCH_CREDITS_BACK = process.env.TMBD_SEARCH_CREDITS_BACK;
const TMDB_DISCOVER_MOVIE_BY_ACTOR = process.env.TMDB_DISCOVER_MOVIE_BY_ACTOR;
const LOWEST_YEAR = 1990;
const CURRENT_YEAR = new Date().getFullYear();

const movieArray = [];

const { saveData } = require("../utilities/readWrite");

/**
 * Function to generate a puzzle.
 * @returns {object} puzzle
 */
const makePuzzle = async () => {
  // generate a random year
  const randomYear = Math.floor(
    Math.random() * (CURRENT_YEAR - LOWEST_YEAR) + LOWEST_YEAR
  );

  // temp array to create the puzzle with
  let tempArray = [];

  for (let i = 0; i < 6; i++) {
    if (tempArray.length === 0) {
      // pick a random top ten movie from a random year > 1990
      let movie = await getMovieFromRandomYear(randomYear);
      // get the cast of that movie
      let cast = await getFirstFiveActors(movie.id);
      // get the director(s) of that movie
      let directors = await getDirector(movie.id);
      // select a key cast member to select the next movie with
      let keyCast = await getRandomActor(cast);
      // assemble the object
      movie = {
        ...movie,
        cast: cast,
        directors: directors,
        keyPerson: keyCast,
      };
      // push the object into the array
      tempArray.push(movie);
    } else {
      // select the previous movie in the array
      let prevMovie = tempArray[i - 1];
      // select the previously selected key cast member
      let prevKeyActor = prevMovie.keyPerson;
      // select a new movie using the key cast member
      let newMovie = await getMovieByActorID(prevKeyActor.id, tempArray);
      if (!newMovie) {
        let newNewKeyActor = await getRandomActor(newPrevCast.cast);
        newMovie = await getMovieByActorID(newNewKeyActor.id, tempArray);
      }
      // get the cast of that movie
      let newCast = await getFiveActors(newMovie.id, prevMovie.cast);
      // get the director(s) of that movie
      let directors = await getDirector(newMovie.id);
      // select a new key cast person
      let newKeyCast = await getRandomActor(newCast);
      // assemble the object
      newMovie = {
        ...newMovie,
        cast: newCast,
        directors: directors,
        keyPerson: newKeyCast,
      };
      // push the object to the array
      tempArray.push(newMovie);
    }
  }
  const timestamp = Date.now();
  const newPuzzle = {
    puzzleId: timestamp,
    puzzle: tempArray,
  };

  saveData(JSON.stringify(newPuzzle), timestamp);
  console.info("puzzle made");
  return newPuzzle;
};

/**
 * Generate a random number up to the specified number
 * @param {number} num
 * @returns {number}
 */
const getRandomNumberUpToInt = (num) => {
  return Math.floor(Math.random() * num);
};

/**
 * Pick one of the top films from a supplied year
 * @param {number} year
 * @returns {object} movie
 */
const getMovieFromRandomYear = async (year) => {
  // generate a random number
  const randomPick = Math.floor(Math.random() * 10);

  const movie = await axios
    .get(`${TMDB_DISCOVER_MOVIE_BY_YEAR_SORT_REV}${year}&api_key=${API_KEY}`)
    .then((res) => {
      let rawResults = res.data.results.filter(
        (movie) =>
          !movie.genre_ids.includes(99) && !movie.genre_ids.includes(1077)
      );
      return rawResults.find((movie, i) => {
        if (i === randomPick) {
          return movie;
        }
      });
    })
    .catch((e) => console.error(e));
  return movie;
};

/**
 * Get five movies from one actor
 * @param {string} id
 * @returns {array} movies
 */
const getFirstFiveActors = async (id) => {
  let tempArray = [];
  await axios
    .get(
      `${TMDB_SEARCH_CREDITS_FRONT}${id}${TMBD_SEARCH_CREDITS_BACK}?api_key=${API_KEY}`
    )
    .then((res) => {
      res.data.cast.forEach((actor) => {
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

/**
 * Get five actors, filtering out any already chosen actors.
 * @param {string} id
 * @param {array} array
 * @returns {array} actors
 */
const getFiveActors = async (movieId, arrayOfActors) => {
  if (movieId && arrayOfActors) {
    let ids = arrayOfActors.map((actor) => {
      return actor.id;
    });
    let actors = [];
    let filtered = [];

    await axios
      .get(
        `${TMDB_SEARCH_CREDITS_FRONT}${movieId}${TMBD_SEARCH_CREDITS_BACK}?api_key=${API_KEY}`
      )
      .then((res) => {
        filtered = res.data.cast.filter((actor) => !ids.includes(actor.id));
        for (let i = 0; i < 5; i++) {
          if (filtered[i] !== null) {
            actors.push(filtered[i]);
          } else {
            actors.push(null);
          }
        }
      })
      .catch((e) => {
        console.error(e);
      });
    return actors;
  }
};

/**
 * get a random actor from the array
 * @param {array} array
 * @returns {object} random actor
 */
const getRandomActor = async (array) => {
  if (array) {
    const randomPick = Math.floor(Math.random() * array.length);
    const randomActor = array.find((actor, i) => {
      if (actor && i === randomPick) {
        return actor;
      }
    });
    return randomActor;
  }
};

/**
 * Get the director of the specified movie.
 * @param {number} movieId
 * @returns {object} director
 */
const getDirector = async (movieId) => {
  if (movieId) {
    let directors = [];
    let filtered = [];
    await axios
      .get(
        `${TMDB_SEARCH_CREDITS_FRONT}${movieId}${TMBD_SEARCH_CREDITS_BACK}?api_key=${API_KEY}`
      )
      .then((res) => {
        filtered = res.data.crew.filter(
          (crew) => crew.job.toLowerCase() === "director"
        );
        for (let i = 0; i < filtered.length; i++) {
          if (filtered[i] !== null) {
            directors.push(filtered[i]);
          } else {
            directors.push(null);
          }
        }
      })
      .catch((e) => {
        console.error(e);
      });
    return directors;
  }
};

/**
 * Return a random movie from an actors top five most popular
 * @param {string} actorId
 * @returns {object} movie
 */
const getMovieByActorID = async (actorId, movies) => {
  if (actorId && movies) {
    let movieIds = movies.map((movie) => movie.id);

    let randomPick = 0;
    let rMovie = {};
    let filtered = [];
    await axios
      .get(`${TMDB_DISCOVER_MOVIE_BY_ACTOR}${actorId}&api_key=${API_KEY}`)
      .then((res) => {
        filtered = res.data.results.filter((movie) => {
          return (
            !movieIds.includes(movie.id) &&
            !movie.genre_ids.includes(99) &&
            !movie.genre_ids.includes(1077)
          );
        });

        if (filtered.length < 5) {
          randomPick = getRandomNumberUpToInt(filtered.length);
        } else {
          randomPick = getRandomNumberUpToInt(5);
        }

        rMovie = filtered.find((movie, i) => {
          if (i === randomPick) {
            return movie;
          }
        });
      })
      .catch((e) => {
        console.error(e);
      });
    return rMovie;
  }
};

module.exports = { makePuzzle };
