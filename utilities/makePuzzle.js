// libraries
const axios = require("axios");
require("dotenv").config();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// variables
const API_KEY = process.env.TMDB_API_KEY;
const TMDB_SEARCH_POP_URL = process.env.TMDB_SEARCH_POP_URL;
const TMDB_SEARCH_CREDITS_FRONT = process.env.TMDB_SEARCH_CREDITS_FRONT;
const TMBD_SEARCH_CREDITS_BACK = process.env.TMBD_SEARCH_CREDITS_BACK;
const TMDB_DISCOVER_MOVIE_BY_ACTOR = process.env.TMDB_DISCOVER_MOVIE_BY_ACTOR;

const LOWEST_YEAR = 1990;
const CURRENT_YEAR = new Date().getFullYear();

const movieArray = [];
let actorArray = [];

// save the data
function saveData(data) {
  let timestamp = Date.now();
  fs.writeFile(`./data/${timestamp}.json`, data, (err) => {
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

  // generate a random number
  const randomPick = Math.floor(Math.random() * 10);

  // randomly get one of the most popular movies of a random year.
  let keyMovie = await axios
    .get(`${TMDB_SEARCH_POP_URL}${randomYear}&api_key=${API_KEY}`)
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

  // get the first five actors
  const firstFiveActors = await getFirstFiveActors(keyMovie.id, actorArray);
  const cast = { cast: firstFiveActors };
  keyMovie = { ...keyMovie, ...cast };
  movieArray.push(keyMovie);
  console.log(movieArray);

  for (let i = 0; i < 6; i++) {}

  // for (let i = 1; i < 6; i++) {
  //   // get an actor from the array
  //   let actor = await getRandomActor(actorArray);
  //   await console.log(`actor: ${actor.name}`);
  //   // get a movie by that actor
  //   let movie = await getMovieByActorID(actor.id, movieArray);

  //   // check the movie returned
  //   if (movie) {
  //     // if the movie returned, push to the array
  //     movieArray.push(movie);
  //   } else {
  //     // if the movie did not return, filter out the previously chosen actor and search for a new one
  //     let tempActors = actorArray.filter(
  //       (tempActor) => tempActor.id !== actor.id
  //     );
  //     let newActor = await getRandomActor(tempActors);
  //     // get a new movie
  //     movie = await getMovieByActorID(newActor.id, movieArray);
  //   }
  //   await console.log(`movie: ${movie.original_title}`);
  //   //load five actors from the chosen movie
  //   let fiveMoreActors = await getFiveActors(movie.id, actorArray);
  //   // spread the new ive actors into the existing array of actors
  //   actorArray = [...actorArray, ...fiveMoreActors];
  // }

  // let count = 0;
  // actorArray.forEach((actor) => (actor === null ? "" : count++));
  // console.log(`count: ${count}`);
  // const newPuzzle = {
  //   puzzleId: uuidv4(),
  //   movies: movieArray,
  //   actors: actorArray,
  // };

  // saveData(JSON.stringify(newPuzzle));
  // return newPuzzle;
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
          tempArray.push(filtered[i]);
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

    const randomPicka = Math.floor(Math.random() * 5);
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

        rMovie = filtered.find((movie, i) => {
          if (i === randomPicka) {
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
