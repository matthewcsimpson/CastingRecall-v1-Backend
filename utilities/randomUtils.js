/**
 * Get a random integer from 0 up to (but not including) the given number.
 * @param {*} num
 * @returns
 */
const getRandomNumberUpToInt = (num) => {
  if (!Number.isFinite(num) || num <= 0) {
    return 0;
  }

  return Math.floor(Math.random() * num);
};

/**
 * Get a random actor from a list.
 * @param {*} actors
 * @returns
 */
const getRandomActor = (actors) => {
  if (!Array.isArray(actors) || actors.length === 0) {
    return null;
  }

  return actors[getRandomNumberUpToInt(actors.length)] ?? null;
};

module.exports = {
  getRandomNumberUpToInt,
  getRandomActor,
};
