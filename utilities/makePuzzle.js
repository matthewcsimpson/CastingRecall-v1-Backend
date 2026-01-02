const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.TMDB_API_KEY;
const TMDB_DISCOVER_MOVIE_BY_YEAR_SORT_REV =
  process.env.TMDB_DISCOVER_MOVIE_BY_YEAR_SORT_REV;
const TMDB_SEARCH_CREDITS_FRONT = process.env.TMDB_SEARCH_CREDITS_FRONT;
const TMBD_SEARCH_CREDITS_BACK = process.env.TMBD_SEARCH_CREDITS_BACK;
const TMDB_DISCOVER_MOVIE_BY_ACTOR = process.env.TMDB_DISCOVER_MOVIE_BY_ACTOR;

const { parseNumberWithDefault } = require("./numberUtils");

const LOWEST_YEAR = parseNumberWithDefault(process.env.LOWEST_YEAR, 1980);
const MAX_RETRIES = parseNumberWithDefault(process.env.MAX_RETRIES, 2);
const RETRY_DELAY_MS = parseNumberWithDefault(process.env.RETRY_DELAY_MS, 300);
const CREDITS_CACHE_MAX = parseNumberWithDefault(
  process.env.CREDITS_CACHE_MAX,
  100
);

const CURRENT_YEAR = new Date().getFullYear();

const { buildNormalizedMovie } = require("./puzzleFormatter");

/**
 * @typedef {import("axios").AxiosResponse<any>} AxiosResponse
 * @typedef {{ id?: number|null, name?: string|null, original_name?: string|null, fullName?: string|null, character?: string|null, profile_path?: string|null, order?: number|null }} TMDBPerson
 * @typedef {{ id?: number|null, title?: string|null, name?: string|null, original_title?: string|null, original_name?: string|null, poster_path?: string|null, release_date?: string|null, overview?: string|null, genre_ids?: Array<number|string>, keyPerson?: TMDBPerson|null, cast?: TMDBPerson[], directors?: TMDBPerson[] }} TMDBMovie
 * @typedef {{ cast: TMDBPerson[], crew: TMDBPerson[] }} TMDBCredits
 * @typedef {Error & { statusCode: number, isExternalServiceError: true, cause?: unknown, rateLimitReset?: string|null }} ExternalServiceError
 * @typedef {TMDBMovie & { keyPerson: TMDBPerson|null, cast: TMDBPerson[], directors: TMDBPerson[] }} PuzzleMovie
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract a numeric year from a TMDB movie.
 * @param {TMDBMovie|undefined|null} movie
 * @returns {number|null}
 */
const getReleaseYear = (movie) => {
  const releaseDate = movie?.release_date;
  if (typeof releaseDate !== "string" || releaseDate.length < 4) {
    return null;
  }

  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
};

/**
 * Determine whether a movie release year falls within configured bounds.
 * @param {TMDBMovie|undefined|null} movie
 * @returns {boolean}
 */
const isWithinYearBounds = (movie) => {
  const releaseYear = getReleaseYear(movie);
  if (releaseYear === null) {
    return false;
  }

  return releaseYear >= LOWEST_YEAR && releaseYear <= CURRENT_YEAR;
};

// In-memory cache for movie credits
const creditsCache = new Map();

// Build TMDB credits URL
const buildCreditsUrl = (movieId) =>
  `${TMDB_SEARCH_CREDITS_FRONT}${movieId}${TMBD_SEARCH_CREDITS_BACK}?api_key=${API_KEY}`;

/**
 * Create a standardized external service error.
 * @param {string} message
 * @param {unknown} [cause]
 * @returns {ExternalServiceError}
 */
const createExternalServiceError = (message, cause) => {
  const error = new Error(message);
  error.name = "ExternalServiceError";
  error.statusCode = 502;
  error.isExternalServiceError = true;
  if (cause) {
    error.cause = cause;
  }
  return error;
};

/**
 * Fetch with retry logic for transient errors.
 * @param {string} url
 * @param {number} [retries]
 * @returns {Promise<AxiosResponse>}
 */
const fetchWithRetry = async (url, retries = MAX_RETRIES) => {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await axios.get(url);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 404) {
        throw createExternalServiceError("TMDB resource not found", error);
      }

      if (attempt >= retries || (status && status < 500)) {
        if (status === 429) {
          error.rateLimitReset =
            error?.response?.headers?.["retry-after"] || null;
        }
        throw error;
      }

      attempt += 1;
      const backoffDelay = RETRY_DELAY_MS * 2 ** (attempt - 1);
      await delay(backoffDelay);
    }
  }
};

/**
 * Get movie credits, utilizing in-memory caching.
 * @param {number|string|null} movieId
 * @returns {Promise<TMDBCredits>}
 */
const getCredits = async (movieId) => {
  if (!movieId) {
    return { cast: [], crew: [] };
  }

  if (creditsCache.has(movieId)) {
    const cached = creditsCache.get(movieId);
    creditsCache.delete(movieId);
    creditsCache.set(movieId, cached);
    return cached;
  }

  const response = await fetchWithRetry(buildCreditsUrl(movieId));
  const credits = response?.data ?? { cast: [], crew: [] };
  if (creditsCache.size >= CREDITS_CACHE_MAX) {
    const oldestKey = creditsCache.keys().next().value;
    creditsCache.delete(oldestKey);
  }
  creditsCache.set(movieId, credits);
  return credits;
};

/**
 * Get a random integer from 0 up to (but not including) the specified number.
 * @param {number} num
 * @returns {number}
 */
const getRandomNumberUpToInt = (num) => {
  if (!Number.isFinite(num) || num <= 0) {
    return 0;
  }

  return Math.floor(Math.random() * num);
};

/**
 * Get a random actor from the provided array.
 * @param {TMDBPerson[]|undefined|null} actors
 * @returns {TMDBPerson|null}
 */
const getRandomActor = (actors) => {
  if (!Array.isArray(actors) || actors.length === 0) {
    return null;
  }

  return actors[getRandomNumberUpToInt(actors.length)] ?? null;
};

/**
 * Get a movie from a random year.
 * @param {number} year
 * @returns {Promise<TMDBMovie|null>}
 */
const getMovieFromRandomYear = async (year) => {
  const url = `${TMDB_DISCOVER_MOVIE_BY_YEAR_SORT_REV}${year}&api_key=${API_KEY}`;
  const response = await fetchWithRetry(url);
  const results = response?.data?.results ?? [];

  const filtered = results.filter(
    (movie) =>
      movie &&
      Array.isArray(movie.genre_ids) &&
      !movie.genre_ids.includes(99) &&
      !movie.genre_ids.includes(1077)
  );

  if (filtered.length === 0) {
    return null;
  }

  return filtered[getRandomNumberUpToInt(filtered.length)] ?? null;
};

/**
 * Get the primary cast members for a movie.
 * @param {number|string|null} movieId
 * @returns {Promise<TMDBPerson[]>}
 */
const getPrimaryCast = async (movieId) => {
  const credits = await getCredits(movieId);
  const cast = Array.isArray(credits.cast) ? credits.cast : [];
  return cast.filter((actor) => actor && actor.order < 5).slice(0, 5);
};

/**
 * Get supporting cast members for a movie, excluding previous cast.
 * @param {number|string|null} movieId
 * @param {TMDBPerson[]} [previousCast]
 * @returns {Promise<TMDBPerson[]>}
 */
const getSupportingCast = async (movieId, previousCast = []) => {
  const credits = await getCredits(movieId);
  const cast = Array.isArray(credits.cast) ? credits.cast : [];
  const excludeIds = new Set(
    previousCast.filter(Boolean).map((actor) => actor.id)
  );

  return cast.filter((actor) => actor && !excludeIds.has(actor.id)).slice(0, 5);
};

/**
 * Get directors for a movie.
 * @param {number|string|null} movieId
 * @returns {Promise<TMDBPerson[]>}
 */
const getDirectors = async (movieId) => {
  const credits = await getCredits(movieId);
  const crew = Array.isArray(credits.crew) ? credits.crew : [];
  return crew.filter(
    (crewMember) =>
      crewMember &&
      typeof crewMember.job === "string" &&
      crewMember.job.toLowerCase() === "director"
  );
};

/**
 * Get a movie by actor ID, excluding already selected movies.
 * @param {number|string|null} actorId
 * @param {TMDBMovie[]} movies
 * @returns {Promise<TMDBMovie|null>}
 */
const getMovieByActorID = async (actorId, movies) => {
  if (!actorId) {
    return null;
  }

  const movieIds = new Set((movies || []).map((movie) => movie.id));
  const url = `${TMDB_DISCOVER_MOVIE_BY_ACTOR}${actorId}&api_key=${API_KEY}`;
  const response = await fetchWithRetry(url);
  const results = response?.data?.results ?? [];

  const filtered = results.filter(
    (movie) =>
      movie &&
      isWithinYearBounds(movie) &&
      !movieIds.has(movie.id) &&
      Array.isArray(movie.genre_ids) &&
      !movie.genre_ids.includes(99) &&
      !movie.genre_ids.includes(1077)
  );

  if (filtered.length === 0) {
    return null;
  }

  const selectionPool = filtered.slice(0, Math.min(filtered.length, 5));
  return selectionPool[getRandomNumberUpToInt(selectionPool.length)] ?? null;
};

/**
 * Combine movie and credit metadata into a puzzle entry.
 * @param {TMDBMovie} movie
 * @param {TMDBPerson[]} cast
 * @param {TMDBPerson[]} directors
 * @param {TMDBPerson|null} keyPerson
 * @returns {PuzzleMovie}
 */
const createPuzzleMovie = (movie, cast, directors, keyPerson) => ({
  ...movie,
  cast,
  directors,
  keyPerson,
});

/**
 * Generate a new puzzle.
 * @returns {Promise<{ puzzleId: number, puzzle: ReturnType<typeof buildNormalizedMovie>[], keyPeople: string[] }>}
 */
const makePuzzle = async () => {
  try {
    const randomYear = Math.floor(
      Math.random() * (CURRENT_YEAR - LOWEST_YEAR) + LOWEST_YEAR
    );

    const tempArray = [];
    const puzzleLength = 6;

    const seedMovie = await getMovieFromRandomYear(randomYear);

    if (!seedMovie) {
      throw createExternalServiceError(
        "TMDB returned no seed movies for the selected year."
      );
    }

    const [seedCast, seedDirectors] = await Promise.all([
      getPrimaryCast(seedMovie.id),
      getDirectors(seedMovie.id),
    ]);

    if (!seedCast.length) {
      throw createExternalServiceError("Seed movie did not include cast data.");
    }

    const seedKeyPerson = getRandomActor(seedCast) ?? seedCast[0];

    tempArray.push(
      createPuzzleMovie(seedMovie, seedCast, seedDirectors, seedKeyPerson)
    );

    while (tempArray.length < puzzleLength) {
      const previousMovie = tempArray[tempArray.length - 1];

      // Try linking via the previously selected actor first, then fall back to other cast members.
      const actorsToTry = [
        previousMovie.keyPerson,
        ...previousMovie.cast.filter(
          (actor) => actor && actor.id !== previousMovie.keyPerson?.id
        ),
      ].filter(Boolean);

      let nextMovie = null;
      const attemptedActorIds = new Set();

      for (const actor of actorsToTry) {
        if (attemptedActorIds.has(actor.id)) {
          continue;
        }
        attemptedActorIds.add(actor.id);
        nextMovie = await getMovieByActorID(actor.id, tempArray);
        if (nextMovie) {
          break;
        }
      }

      if (!nextMovie) {
        throw createExternalServiceError(
          "Unable to find a connected movie for the current cast."
        );
      }

      const [nextCast, nextDirectors] = await Promise.all([
        getSupportingCast(nextMovie.id, previousMovie.cast),
        getDirectors(nextMovie.id),
      ]);

      if (!nextCast.length) {
        throw createExternalServiceError(
          "Discovered movie did not include sufficient cast data."
        );
      }

      const nextKeyPerson = getRandomActor(nextCast) ?? nextCast[0];

      tempArray.push(
        createPuzzleMovie(nextMovie, nextCast, nextDirectors, nextKeyPerson)
      );
    }

    const timestamp = Date.now();
    const normalizedPuzzle = tempArray.map((movie) =>
      buildNormalizedMovie(movie)
    );
    const keyPeople = normalizedPuzzle.map(
      (movie) => movie?.keyPerson?.name ?? ""
    );

    const newPuzzle = {
      puzzleId: timestamp,
      puzzle: normalizedPuzzle,
      keyPeople,
    };

    console.info("puzzle made");
    return newPuzzle;
  } catch (error) {
    if (error?.isExternalServiceError) {
      throw error;
    }

    throw createExternalServiceError("Failed to generate puzzle.", error);
  }
};

module.exports = { makePuzzle };
