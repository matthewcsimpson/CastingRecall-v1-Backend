/**
 * Parse a value into a finite number, or return the fallback.
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
const parseNumberWithDefault = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Parse a value into an integer, or return the fallback.
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
const parseIntWithDefault = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = { parseNumberWithDefault, parseIntWithDefault };
