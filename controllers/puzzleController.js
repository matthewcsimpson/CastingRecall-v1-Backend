const { makePuzzle } = require("../utilities/makePuzzle");
const { normalizePuzzle } = require("../utilities/puzzleFormatter");
const {
  insertPuzzleToDb,
  listPuzzlesFromDb,
  getLatestPuzzleFromDb,
  getPuzzleByIdFromDb,
} = require("../repositories/puzzleRepository");

/**
 * Endpoint controller to generate a new puzzle.
 * @param {object} req
 * @param {object} res
 */
exports.generatePuzzle = async (req, res) => {
  const generationKey = process.env.GENERATION_KEY;

  if (!generationKey) {
    console.error("---> generatePuzzle: GENERATION_KEY not configured");
    return res.status(500).json({ message: "Puzzle generation disabled" });
  }

  const authHeader = req.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Missing generation key" });
  }

  const suppliedKey = authHeader.substring("Bearer ".length).trim();

  if (!suppliedKey || suppliedKey !== generationKey) {
    return res.status(403).json({ message: "Invalid generation key" });
  }

  try {
    const puzzle = await makePuzzle();
    await insertPuzzleToDb({
      puzzleId: puzzle.puzzleId,
      puzzle: puzzle.puzzle,
      keyPeople: puzzle.keyPeople,
    });
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
    const summaries = await listPuzzlesFromDb();
    return res.status(200).json(summaries);
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
    const latest = await getLatestPuzzleFromDb();

    if (!latest) {
      return res.status(204).send("no puzzles available");
    }

    const puzzle = normalizePuzzle({
      puzzleId: latest.puzzleId,
      puzzle: latest.puzzle,
      keyPeople: latest.keyPeople,
    });

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

  try {
    const record = await getPuzzleByIdFromDb(puzzleId);

    if (!record) {
      return res.status(404).json({ message: "Puzzle not found" });
    }

    const puzzle = normalizePuzzle({
      puzzleId: record.puzzleId,
      puzzle: record.puzzle,
      keyPeople: record.keyPeople,
    });

    if (!puzzle) {
      return res.status(500).json({ message: "Stored puzzle is invalid" });
    }

    return res.status(200).json(puzzle);
  } catch (err) {
    console.error("---> getPuzzleById: ", err);
    return res.status(500).json({ message: "Unable to load puzzle" });
  }
};
