const fs = require("fs/promises");
const { makePuzzle } = require("../utilities/makePuzzle");
const { normalizePuzzle } = require("../utilities/puzzleFormatter");

/**
 * Endpoint controller to generate a new puzzle.
 * @param {object} req
 * @param {object} res
 */
exports.generatePuzzle = async (_req, res) => {
  try {
    await makePuzzle();
    return res.send("puzzle made!");
  } catch (err) {
    if (err?.isExternalServiceError) {
      return res.status(502).json({ message: err.message });
    }

    console.error("---> generatePuzzle: ", err);
    return res.status(500).json({ message: "Unable to generate puzzle" });
  }
};

/**
 * Endpoint controller to return a list of puzzles.
 * @param {object} req
 * @param {object} res
 */
exports.listPuzzles = async (_req, res) => {
  try {
    const files = await fs.readdir("./data", { encoding: "utf8" });

    const summaries = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .sort()
        .map(async (file) => {
          try {
            const data = await fs.readFile(`./data/${file}`, "utf8");
            const parsed = JSON.parse(data);
            const normalized = normalizePuzzle(parsed);

            if (!normalized || !normalized.puzzleId) {
              return null;
            }

            const keyPeople = Array.isArray(normalized.keyPeople)
              ? normalized.keyPeople.map((name) => name ?? "")
              : [];

            return {
              puzzleId: normalized.puzzleId,
              keyPeople,
            };
          } catch (error) {
            console.error("---> listPuzzles: unable to parse", file, error);
            return null;
          }
        })
    );

    const filteredSummaries = summaries.filter(Boolean);
    return res.status(200).json(filteredSummaries);
  } catch (err) {
    console.error("---> listPuzzles: ", err);
    return res.status(500).json({ message: "Unable to list puzzles" });
  }
};

/**
 * Endpoint controller to return the most recently generated puzzle.
 * @param {object} req
 * @param {object} res
 */
exports.getLatestPuzzle = async (_req, res) => {
  try {
    const files = await fs.readdir("./data/", { encoding: "utf8" });
    if (!files || files.length === 0) {
      return res.status(204).send("no puzzles available");
    }

    const sortedFiles = files.sort();
    const latestFile = sortedFiles[sortedFiles.length - 1];
    const data = await fs.readFile(`./data/${latestFile}`, "utf8");
    const puzzle = normalizePuzzle(JSON.parse(data));

    if (!puzzle) {
      return res.status(500).json({ message: "Stored puzzle is invalid" });
    }

    return res.status(200).json(puzzle);
  } catch (err) {
    console.error("---> getLatestPuzzle: ", err);
    return res.status(500).json({ message: "Unable to load latest puzzle" });
  }
};

/**
 * Endpoint controller to return a specific puzzle by its ID.
 * @param {object} req
 * @param {object} res
 */
exports.getPuzzleById = async (req, res) => {
  const { puzzleid } = req.params;
  const puzzleId = Number(puzzleid);

  if (Number.isNaN(puzzleId)) {
    return res.status(400).json({ message: "Invalid puzzle id" });
  }

  const filePath = `./data/${puzzleId}.json`;

  try {
    const data = await fs.readFile(filePath, "utf8");
    const puzzle = normalizePuzzle(JSON.parse(data));

    if (!puzzle) {
      return res.status(500).json({ message: "Stored puzzle is invalid" });
    }

    return res.status(200).json(puzzle);
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.status(404).json({ message: "Puzzle not found" });
    }

    console.error("---> getPuzzleById: ", err);
    return res.status(500).json({ message: "Unable to load puzzle" });
  }
};
