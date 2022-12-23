const express = require("express");
const fs = require("fs");

// imports
const { makePuzzle } = require("../utilities/makePuzzle");

const {
  loadFile,
  loadDir,
  trimFileNameFromString,
} = require("../utilities/readWrite");

/**
 * Endpoint controller to generate a new puzzle.
 * @param {object} req
 * @param {object} res
 */
exports.generatePuzzle = async (req, res) => {
  await makePuzzle();
  res.send("puzzle made!");
};

/**
 * Endpoint controller to return a list of puzzles.
 * @param {object} req
 * @param {object} res
 */
exports.listPuzzles = (req, res) => {
  loadDir("./data", (err, files) => {
    if (err) {
      console.error(err);
    } else {
      const formattedStrings = [];
      files.map((string) =>
        formattedStrings.push(trimFileNameFromString(string))
      );
      res.status(200).json(formattedStrings);
    }
  });
};

/**
 * Endpoint controller to return the most recently generated puzzle.
 * @param {object} req
 * @param {object} res
 */
exports.getLatestPuzzle = (req, res) => {
  loadDir("./data/", (err, files) => {
    if (err) {
      console.error(err);
    } else if (files) {
      loadFile(`./data/${files[files.length - 1]}`, (err, data) => {
        if (err) {
          console.error(err);
        } else {
          const puzzle = JSON.parse(data);
          res.status(200).json(puzzle);
        }
      });
    } else {
      res.status(204).send("no puzzles available");
    }
  });
};

/**
 * Endpoint controller to return a specific puzzle by its ID.
 * @param {object} req
 * @param {object} res
 */
exports.getPuzzleById = (req, res) => {
  const { puzzleid } = req.params;
  loadDir("./data/", (err, files) => {
    if (err) {
      console.error(err);
    } else {
      files.forEach((file) => {
        loadFile(`./data/${file}`, (err, data) => {
          let tempdata = JSON.parse(data);
          if (parseInt(puzzleid) === tempdata["puzzleId"]) {
            res.status(200).json(tempdata);
          }
        });
      });
    }
  });
};

exports.get;
