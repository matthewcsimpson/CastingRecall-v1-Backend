const fs = require("fs/promises");
const path = require("path");
const { insertPuzzleToDb } = require("../repositories/puzzleRepository");
const { initializePool, closePool } = require("../utilities/db");
const { normalizePuzzle } = require("../utilities/puzzleFormatter");

const DATA_DIR = path.resolve(__dirname, "../data");

const readPuzzleFiles = async () => {
  try {
    const files = await fs.readdir(DATA_DIR);
    return files.filter((file) => file.endsWith(".json")).sort();
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

const loadPuzzle = async (fileName) => {
  const filePath = path.join(DATA_DIR, fileName);
  const contents = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(contents);
  return normalizePuzzle(parsed);
};

const seed = async () => {
  let exitCode = 0;

  try {
    await initializePool();

    const files = await readPuzzleFiles();

    if (!files.length) {
      console.info("No local puzzle files found to seed");
      return;
    }

    for (const fileName of files) {
      try {
        const puzzle = await loadPuzzle(fileName);

        if (!puzzle || !puzzle.puzzleId) {
          console.warn(`Skipping invalid puzzle file: ${fileName}`);
          continue;
        }

        await insertPuzzleToDb({
          puzzleId: puzzle.puzzleId,
          puzzle: puzzle.puzzle,
          keyPeople: puzzle.keyPeople,
        });
        console.info(`Seeded puzzle ${puzzle.puzzleId} from ${fileName}`);
      } catch (error) {
        console.error(`Failed to seed ${fileName}`, error);
      }
    }
  } catch (error) {
    console.error("Seeding failed", error);
    exitCode = 1;
  } finally {
    try {
      await closePool();
    } catch (closeError) {
      console.error("Failed to close database pool", closeError);
      exitCode = 1;
    }

    process.exit(exitCode);
  }
};

seed();
