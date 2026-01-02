const { makePuzzle } = require("../utilities/makePuzzle");
const { normalizePuzzle } = require("../utilities/puzzleFormatter");
const {
  insertPuzzleToDb,
  listPuzzlesFromDb,
  getLatestPuzzleFromDb,
  getPuzzleByIdFromDb,
} = require("../repositories/puzzleRepository");
const { parseIntWithDefault } = require("../utilities/numberUtils");

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const MAX_GENERATION_ATTEMPTS = parseIntWithDefault(
  process.env.MAX_GENERATION_ATTEMPTS,
  3
);

/**
 * Endpoint controller to generate a new puzzle.
 * @param {object} req
 * @param {object} res
 */
exports.generatePuzzle = async (req, res) => {
  const generationKey = process.env.GENERATION_KEY;

  if (!generationKey) {
    console.error("---> generatePuzzle: GENERATION_KEY not configured");
    return res.status(500).json({ message: "Puzzle generation unavailable" });
  }

  const authHeader = req.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Missing generation key" });
  }

  const suppliedKey = authHeader.substring("Bearer ".length).trim();

  if (suppliedKey !== generationKey) {
    return res.status(403).json({ message: "Invalid generation key" });
  }

  let attempt = 0;
  let lastError = null;

  while (attempt < MAX_GENERATION_ATTEMPTS) {
    try {
      const puzzle = await makePuzzle();
      await insertPuzzleToDb({
        puzzleId: puzzle.puzzleId,
        puzzle: puzzle.puzzle,
        keyPeople: puzzle.keyPeople,
      });
      return res.send("puzzle made!");
    } catch (err) {
      lastError = err;
      attempt += 1;

      if (err?.isExternalServiceError) {
        console.warn(
          `---> generatePuzzle attempt ${attempt} failed (external service): ${err.message}`
        );
      } else {
        console.error(`---> generatePuzzle attempt ${attempt} failed:`, err);
      }

      if (attempt < MAX_GENERATION_ATTEMPTS) {
        continue;
      }
    }
  }

  if (lastError?.isExternalServiceError) {
    return res.status(502).json({ message: lastError.message });
  }

  return res.status(500).json({ message: "Unable to generate puzzle" });
};

/**
 * Endpoint controller to return a list of puzzles.
 * @param {object} req
 * @param {object} res
 */
exports.listPuzzles = async (req, res) => {
  const { page: rawPage, pageSize: rawPageSize } = req.query;

  const page =
    rawPage === undefined ? DEFAULT_PAGE : Number.parseInt(rawPage, 10);
  const pageSize =
    rawPageSize === undefined
      ? DEFAULT_PAGE_SIZE
      : Number.parseInt(rawPageSize, 10);

  if (Number.isNaN(page) || page < 1) {
    return res.status(400).json({ message: "Invalid page value" });
  }

  if (Number.isNaN(pageSize) || pageSize < 1) {
    return res.status(400).json({ message: "Invalid pageSize value" });
  }

  const effectivePageSize = Math.min(pageSize, MAX_PAGE_SIZE);
  const offset = (page - 1) * effectivePageSize;

  try {
    const { totalCount, puzzles } = await listPuzzlesFromDb({
      limit: effectivePageSize,
      offset,
    });

    const totalPages =
      totalCount === 0 ? 0 : Math.ceil(totalCount / effectivePageSize);

    return res.status(200).json({
      puzzles,
      pagination: {
        page,
        pageSize: effectivePageSize,
        totalItems: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && totalPages > 0,
      },
    });
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
