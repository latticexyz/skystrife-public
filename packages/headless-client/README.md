# Sky Strife Headless Client

This is a full-featured Sky Strife client that does not require a browser/UI to play.

## Getting Started

The scripts/example.ts file contains a simple example of how to use the client.

You can run it against the current, live Sky Strife world with `pnpm example:redstone`.

```typescript
import { createSkyStrife } from "../src/createSkyStrife";

const skyStrife = await createSkyStrife();
```

`createSkyStrife` will connect to an exsiting Sky Strife world and sync all onchain data locally.
