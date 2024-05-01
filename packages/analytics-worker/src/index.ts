import { Hono } from "hono";
import { Client } from "pg";

type Bindings = {
  DB_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.post("/track-client-event/:chain_id/:world_address", async (c) => {
  const client = new Client(c.env.DB_URL);
  await client.connect();

  const country = c.req.raw.cf?.country || "unknown";

  const { chain_id, world_address } = c.req.param();
  const { event_name, player_address, session_wallet_address, data } = await c.req.json();

  console.log(`Received event ${event_name} for ${world_address} on chain ${chain_id}`);
  console.log(`  player_address: ${player_address}`);
  console.log(`  session_wallet_address: ${session_wallet_address}`);
  console.log(`  data: ${data}`);
  console.log(`  country: ${country}`);

  const now = new Date().toISOString();

  try {
    await client.query(
      `
      INSERT INTO public.client_events_${chain_id} (
        event_name,
        world_address,
        player_address,
        session_wallet_address,
        data,
        country,
        created_at
      ) VALUES (
        '${event_name}',
        '${world_address}',
        '${player_address}',
        '${session_wallet_address}',
        '${data}',
        '${country}',
        '${now}'
      );
    `,
    );

    return c.json({ ok: true, message: `Stored event ${event_name}` });
  } catch (e) {
    console.error(e);

    return c.json({ err: (e as Error).toString() }, 500);
  }
});

app.post("/track/:chain_id/:world_address", async (c) => {
  const client = new Client(c.env.DB_URL);
  await client.connect();

  const country = c.req.raw.cf?.country || "unknown";
  const ip = c.req.header("CF-Connecting-IP") || "unknown";

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
    action_id,
    client_submitted_timestamp,
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
  console.log(`  action_id: ${action_id}`);
  console.log(`  client_submitted_timestamp: ${client_submitted_timestamp}`);
  console.log(`  country: ${country}`);
  console.log(`  ip: ${ip}`);

  const now = new Date().toISOString();

  try {
    await client.query(
      `INSERT INTO public.player_transactions_${chain_id} (
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
        session_wallet_address,
        action_id,
        client_submitted_timestamp,
        country,
        ip,
        created_at
      ) VALUES (
        '${world_address}',
        '${entity}',
        '${system_call}',
        '${system_id}',
        ${gas_estimate},
        ${manual_gas_estimate === "true" ? "TRUE" : "FALSE"},
        ${gas_price_gwei},
        '${status}',
        '${hash}',
        '${error}',
        ${submitted_block},
        ${completed_block},
        ${submitted_timestamp},
        ${completed_timestamp},
        '${player_address}',
        '${match_entity}',
        '${session_wallet_address}',
        '${action_id}',
        ${client_submitted_timestamp},
        '${country}',
        '${ip}',
        '${now}'
      );`,
    );

    return c.json({ ok: true, message: `Stored tx ${hash}` });
  } catch (e) {
    console.log(e);

    return c.json({ err: (e as Error).toString() }, 500);
  }
});

app.get("/show-gdpr", async (c) => {
  const country = (c.req.raw.cf?.country || "unknown") as string;

  c.res.headers.set("Access-Control-Allow-Origin", "*");

  return c.json(
    {
      shouldShow: country !== "US",
    },
    200,
  );
});

export default app;
