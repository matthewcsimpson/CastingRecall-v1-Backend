require("dotenv").config();
const { Pool } = require("pg");

let pool = null;

const buildPoolConfig = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
  }

  const config = {
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  };

  if (process.env.NODE_ENV === "production") {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
};

const getPool = () => {
  if (!pool) {
    pool = new Pool(buildPoolConfig());

    pool.on("error", (err) => {
      console.error("Unexpected PostgreSQL client error", err);
    });
  }

  return pool;
};

const query = (text, params) => {
  return getPool().query(text, params);
};

const withClient = async (callback) => {
  const client = await getPool().connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
};

module.exports = {
  getPool,
  query,
  withClient,
};
