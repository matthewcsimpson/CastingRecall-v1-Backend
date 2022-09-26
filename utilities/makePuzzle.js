// libraries
const axios = require("axios");
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

// save the data
function saveData(data, filename) {
  // let timestamp = Date.now();
  fs.writeFile(`./data/${filename}.json`, data, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

/**
 * Function to generate a puzzle.
 */
const makePuzzle = async () => {
  // generate a random year
  const randomYear = Math.floor(
    Math.random() * (CURRENT_YEAR - LOWEST_YEAR) + LOWEST_YEAR
  );
  console.info(`seed year: ${randomYear}`);

  // generate a random number
  const randomPick = Math.floor(Math.random() * 10);
  console.info(`random number: ${randomPick}`);
  let tempArray = [];

  for (let i = 0; i < 6; i++) {
    if (tempArray.length === 0) {
      // pick a random top ten movie from a random year > 1990
      let movie = await axios
        .get(
          `${TMDB_DISCOVER_MOVIE_BY_YEAR_SORT_REV}${randomYear}&api_key=${API_KEY}`
        )
        .then((res) => {
          let rawResults = res.data.results.filter(
            (movie) =>
              !movie.genre_ids.includes(99) && !movie.genre_ids.includes(1077)
          );

          return rawResults.find((movie, i) => {
            if (i === randomPick) {
              console.info(`first movie: ${movie.original_title}`);
              return movie;
            }
          });
        })
        .catch((e) => console.error(e));
      // get the cast of that movie
      let cast = await getFirstFiveActors(movie.id);
      cast.forEach((p) => console.info(p.name));
      // select a key cast member to select the next movie with
      let keyCast = await getRandomActor(cast);
      console.info(`key person: ${keyCast.name}`);
      // assemble the object
      movie = { ...movie, cast: cast, keyPerson: keyCast };
      // push the object into the array
      tempArray.push(movie);
    } else {
      // select the previous movie in the array
      let prevMovie = tempArray[i - 1];
      // select the previously selected key cast member
      let prevKeyActor = prevMovie.keyPerson;
      // select a new movie using the key cast member
      let newMovie = await getMovieByActorID(prevKeyActor.id, tempArray);
      console.info(newMovie.original_title);
      // get the cast of that movie
      let newCast = await getFiveActors(newMovie.id, prevMovie.cast);
      newCast.forEach((p) => console.info(p.name));
      // select a new key cast person
      let newKeyCast = await getRandomActor(newCast);
      console.log(`key person: ${newKeyCast.name}`);
      // assemble the object
      newMovie = { ...newMovie, cast: newCast, keyPerson: newKeyCast };
      // push the object to the array
      tempArray.push(newMovie);
    }
  }
  const uid = uuidv4();
  const newPuzzle = {
    puzzleId: uid,
    puzzle: tempArray,
  };

  saveData(JSON.stringify(newPuzzle), uid);
  return newPuzzle;
};

/**
 * Generate a random number up to the specified number
 * @param {number} num
 * @returns
 */
const getRandomNumberUpToInt = (num) => {
  return Math.floor(Math.random() * num);
};

/**
 * Get five movies from one actor
 * @param {string} id
 * @returns
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
 */
const getFiveActors = async (movieId, arrayOfActors) => {
  if (movieId && arrayOfActors) {
    let ids = arrayOfActors.map((actor) => {
      return actor.id;
    });
    let tempArray = [];
    let filtered = [];

    await axios
      .get(
        `${TMDB_SEARCH_CREDITS_FRONT}${movieId}${TMBD_SEARCH_CREDITS_BACK}?api_key=${API_KEY}`
      )
      .then((res) => {
        filtered = res.data.cast.filter((actor) => !ids.includes(actor.id));
        for (let i = 0; i < 5; i++) {
          if (filtered[i] !== null) {
            tempArray.push(filtered[i]);
          } else {
            tempArray.push(null);
          }
        }
      })
      .catch((e) => {
        console.error(e);
      });
    return tempArray;
  }
};

/**
 * get a random actor from the array
 * @param {array} array
 * @returns {object}
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
 * Return a random movie from an actors top five most popular
 * @param {string} actorId
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

const trimFileNameFromString = (string) => {
  const substrings = string.split(".");
  return substrings[0];
};

module.exports = { makePuzzle, trimFileNameFromString };
