DROP TABLE IF EXISTS client_events_31337;
CREATE TABLE IF NOT EXISTS client_events_31337
  (
    id INTEGER PRIMARY KEY,
    event_name TEXT,
    world_address TEXT,
    player_address TEXT,
    session_wallet_address TEXT,
    data TEXT
  );

DROP TABLE IF EXISTS client_events_17001;
CREATE TABLE IF NOT EXISTS client_events_17001
  (
    id INTEGER PRIMARY KEY,
    event_name TEXT,
    world_address TEXT,
    player_address TEXT,
    session_wallet_address TEXT,
    data TEXT
  );