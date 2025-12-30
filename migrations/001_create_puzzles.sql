CREATE TABLE IF NOT EXISTS puzzles (
    puzzle_id BIGINT PRIMARY KEY,
    puzzle JSONB NOT NULL,
    key_people TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS puzzles_created_at_idx ON puzzles (created_at DESC);
