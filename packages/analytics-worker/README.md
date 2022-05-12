# Analytics Worker

Cloudflare worker connected to a D1 database instance for collecting player transaction data.

## Development

Without running this locally, the local Sky Strife configuration points to the production worker with a separate database for the forge node chain ID. If you want to run this and develop locally, you'll need to do the following:

1. Get the `wrangler.toml` configuration from another developer. This describes the worker and the D1 database configuration.
2. Run `pnpm dev` to initialize a local D1 database and start the worker in watch mode.
3. You can manually insert a row with this command:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"entity":"0x000000","system_call":"charge","gas_estimate":null,"manual_gas_estimate":false,"status":"pending","hash":"0x000001","error":null,"submitted_block": 1,"completed_block": 2,"submitted_timestamp":null,"completed_timestamp":null, "player_address": "0x0004"}' http://localhost:8787/track/31337/0x01
```

4. To test that the worker is running correctly, you can manually query the database with this command:

```bash
curl http://localhost:8787/all/31337/0x0004
```

## Deployment

If your `wrangler.toml` is configured properly, simply `pnpm deploy-worker`.

## Fetching Data

Sample command for fetching all playtest analytics:

```bash
curl https://analytics-worker.latticexyz.workers.dev/all/901 #901 is chain id of redstone
```
