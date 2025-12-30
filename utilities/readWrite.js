const fs = require("fs/promises");
const path = require("path");

/**
 * Function to read the INVENTORY JSON file.
 * @param {string} location
 */
exports.loadFile = async (location) => {
  return fs.readFile(location, "utf8");
};

/**
 * Function to read files in a directory.
 * @param {string} location
 */
exports.loadDir = async (location) => {
  return fs.readdir(location, "utf8");
};

/**
 * Function to save data as a JSON file.
 * @param {string} data
 * @param {string} filename
 */
exports.saveData = async (data, filename, directory = "./data") => {
  const filePath = path.join(directory, `${filename}.json`);
  await fs.writeFile(filePath, data);
};

/**
 * Trim a string.
 * @param {*} string
 * @returns {string} truncated string
 */
exports.trimFileNameFromString = (input) => {
  return path.parse(input ?? "").name;
};
