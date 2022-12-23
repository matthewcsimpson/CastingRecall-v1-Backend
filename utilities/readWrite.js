const fs = require("fs");

/**
 * Function to read the INVENTORY JSON file.
 * @param {string} location
 * @param {function} callback
 */
exports.loadFile = (location, callback) => {
  fs.readFile(location, "utf8", callback);
};

/**
 * Function to read files in a directory.
 * @param {string} location
 * @param {function} callback
 */
exports.loadDir = (location, callback) => {
  fs.readdir(location, "utf8", callback);
};

/**
 * Function to save data as a JSON file.
 * @param {string} data
 * @param {string} filename
 */
exports.saveData = (data, filename) => {
  // let timestamp = Date.now();
  fs.writeFile(`./data/${filename}.json`, data, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

/**
 * Trim a string.
 * @param {*} string
 * @returns {string} truncated string
 */
exports.trimFileNameFromString = (string) => {
  const substrings = string.split(".");
  return substrings[0];
};
