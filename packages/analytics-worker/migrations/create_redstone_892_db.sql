CREATE TABLE IF NOT EXISTS player_transactions_892
  (
    id INTEGER PRIMARY KEY,
    entity TEXT,
    system_call TEXT,
    gas_estimate INTEGER,
    manual_gas_estimate BOOLEAN,
    status TEXT,
    hash TEXT,
    error TEXT,
    submitted_block INTEGER,
    completed_block INTEGER,
    submitted_timestamp INTEGER,
    completed_timestamp INTEGER,
    world_address TEXT,
    player_address TEXT
  );