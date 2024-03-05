DROP TABLE IF EXISTS player_transactions_31337;
CREATE TABLE IF NOT EXISTS player_transactions_31337
  (
    id INTEGER PRIMARY KEY,
    entity TEXT,
    system_call TEXT,
    system_id TEXT,
    gas_estimate INTEGER,
    manual_gas_estimate BOOLEAN,
    gas_price_gwei FLOAT,
    status TEXT,
    hash TEXT,
    error TEXT,
    submitted_block INTEGER,
    completed_block INTEGER,
    submitted_timestamp INTEGER,
    completed_timestamp INTEGER,
    world_address TEXT,
    player_address TEXT,
    match_entity TEXT,
    session_wallet_address TEXT,
    action_id TEXT,
    client_submitted_timestamp INTEGER
  );

DROP TABLE IF EXISTS player_transactions_17001;
CREATE TABLE IF NOT EXISTS player_transactions_17001
  (
    id INTEGER PRIMARY KEY,
    entity TEXT,
    system_call TEXT,
    system_id TEXT,
    gas_estimate INTEGER,
    manual_gas_estimate BOOLEAN,
    gas_price_gwei FLOAT,
    status TEXT,
    hash TEXT,
    error TEXT,
    submitted_block INTEGER,
    completed_block INTEGER,
    submitted_timestamp INTEGER,
    completed_timestamp INTEGER,
    world_address TEXT,
    player_address TEXT,
    match_entity TEXT,
    session_wallet_address TEXT,
    action_id TEXT,
    client_submitted_timestamp INTEGER
  );