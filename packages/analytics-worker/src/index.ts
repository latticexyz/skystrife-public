import { Hono } from "hono";

// This ensures c.env.DB is correctly typed
type Bindings = {
  DB: D1Database;
  CLIENT_EVENTS: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.post("/track-client-event/:chain_id/:world_address", async (c) => {
  const { chain_id, world_address } = c.req.param();
  const { event_name, player_address, session_wallet_address, data } = await c.req.json();

  console.log(`Received event ${event_name} for ${world_address} on chain ${chain_id}`);
  console.log(`  player_address: ${player_address}`);
  console.log(`  session_wallet_address: ${session_wallet_address}`);
  console.log(`  data: ${data}`);

  try {
    await c.env.CLIENT_EVENTS.prepare(
      `
      INSERT INTO client_events_${chain_id} (
        event_name,
        world_address,
        player_address,
        session_wallet_address,
        data
      ) VALUES (
        $event_name,
        $world_address,
        $player_address,
        $session_wallet_address,
        $data
      );
    `
    )
      .bind(event_name, world_address, player_address, session_wallet_address, data)
      .run();

    return c.json({ ok: true, message: `Stored event ${event_name}` });
  } catch (e) {
    console.error(e);

    return c.json({ err: (e as Error).toString() }, 500);
  }
});

app.get(`/client-events/:chain_id/:world_address`, async (c) => {
  const { chain_id, world_address } = c.req.param();

  try {
    const queryParams = c.req.query();
    const limit = queryParams["limit"] || 100;
    const offset = queryParams["offset"] || 0;

    const { results } = await c.env.CLIENT_EVENTS.prepare(
      `SELECT
          *
        FROM client_events_${chain_id}
          WHERE world_address = $world_address
          ORDER BY id ASC
          LIMIT $limit
          OFFSET $offset;
      `
    )
      .bind(world_address, limit, offset)
      .all();
    return c.json(results);
  } catch (e) {
    return c.json({ err: e }, 500);
  }
});

app.post("/track/:chain_id/:world_address", async (c) => {
  const { chain_id, world_address } = c.req.param();
  const {
    entity,
    system_call,
    system_id,
    gas_estimate,
    manual_gas_estimate,
    gas_price_gwei,
    status,
    hash,
    error,
    submitted_block,
    completed_block,
    submitted_timestamp,
    completed_timestamp,
    player_address,
    match_entity,
    session_wallet_address,
  } = await c.req.json();

  console.log(`Received tx ${hash} for ${world_address} on chain ${chain_id}`);
  console.log(`  entity: ${entity}`);
  console.log(`  system_call: ${system_call}`);
  console.log(`  gas_estimate: ${gas_estimate}`);
  console.log(`  manual_gas_estimate: ${manual_gas_estimate}`);
  console.log(`  gas_price_gwei: ${gas_price_gwei}`);
  console.log(`  status: ${status}`);
  console.log(`  hash: ${hash}`);
  console.log(`  error: ${error}`);
  console.log(`  submitted_block: ${submitted_block}`);
  console.log(`  completed_block: ${completed_block}`);
  console.log(`  submitted_timestamp: ${submitted_timestamp}`);
  console.log(`  completed_timestamp: ${completed_timestamp}`);
  console.log(`  player_address: ${player_address}`);
  console.log(`  match_entity: ${match_entity}`);
  console.log(`  session_wallet_address: ${session_wallet_address}`);

  try {
    await c.env.DB.prepare(
      `
      INSERT INTO player_transactions_${chain_id} (
        world_address,
        entity,
        system_call,
        system_id,
        gas_estimate,
        manual_gas_estimate,
        gas_price_gwei,
        status,
        hash,
        error,
        submitted_block,
        completed_block,
        submitted_timestamp,
        completed_timestamp,
        player_address,
        match_entity,
        session_wallet_address
      ) VALUES (
        $world_address,
        $entity,
        $system_call,
        $system_id,
        $gas_estimate,
        $manual_gas_estimate,
        $gas_price_gwei,
        $status,
        $hash,
        $error,
        $submitted_block,
        $completed_block,
        $submitted_timestamp,
        $completed_timestamp,
        $player_address,
        $match_entity,
        $session_wallet_address
      );
    `
    )
      .bind(
        world_address,
        entity,
        system_call,
        system_id,
        gas_estimate,
        manual_gas_estimate === "true" ? "TRUE" : "FALSE",
        gas_price_gwei,
        status,
        hash,
        error,
        submitted_block,
        completed_block,
        submitted_timestamp,
        completed_timestamp,
        player_address,
        match_entity,
        session_wallet_address
      )
      .run();

    return c.json({ ok: true, message: `Stored tx ${hash}` });
  } catch (e) {
    return c.json({ err: (e as Error).toString() }, 500);
  }
});

// sample post request using curl
// curl -X POST -H "Content-Type: application/json" -d '{"entity":"0x000000","system_call":"charge","gas_estimate":null,"manual_gas_estimate":false,"status":"pending","hash":"0x000001","error":null,"submitted_block": 1,"completed_block": 2,"submitted_timestamp":null,"completed_timestamp":null, "player_address": "0x0004"}' http://localhost:8787/track/1/0x01

app.get("/all/:chain_id", async (c) => {
  const { chain_id } = c.req.param();

  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM player_transactions_${chain_id};`).all();
    return c.json(results);
  } catch (e) {
    return c.json({ err: e }, 500);
  }
});

app.get("/all/:chain_id/:world_address", async (c) => {
  const { chain_id, world_address } = c.req.param();

  try {
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM player_transactions_${chain_id} WHERE world_address = $world_address;`
    )
      .bind(world_address)
      .all();
    return c.json(results);
  } catch (e) {
    return c.json({ err: e }, 500);
  }
});

export default app;
