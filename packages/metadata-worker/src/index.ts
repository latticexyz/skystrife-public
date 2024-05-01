import { Hono } from "hono";

const app = new Hono();

app.get("/metadata/:id", async (c) => {
  c.res.headers.set("Access-Control-Allow-Origin", "*");

  const id = c.req.param("id");

  return c.json(
    {
      name: "Sky Strife Season Pass (Season 1)",
      description:
        "Sky Strife Season Pass is a soul-bound NFT that gives the holder access to exclusive features in the Sky Strife game.",
      image: "https://play.skystrife.xyz/public/assets/season-pass.png",
      features:
        "This Season Pass grants access to: exclusive matches, all heroes, this season’s new maps, private matches, and the ability to set 🔮 entrance fees on matches.",
      external_url: "https://play.skystrife.xyz",
      disclaimer:
        "The Sky Strife Season Pass is soul-bound (e.g. cannot be sold or traded) and is only valid for a single season of Sky Strife. Each season’s start and end dates are listed in the attributes of each NFT.",
      attributes: [
        { trait_type: "id", value: id },
        { trait_type: "Season Name", value: "Season 1: Sky and Stone" },
        { trait_type: "Season Start Date", value: "May 1st, 2024" },
        { trait_type: "Season End Date", value: "May 31st, 2024" },
        { trait_type: "Mint Price", value: "0.03 ETH" },
      ],
    },
    200,
  );
});

app.get("/metadata/skykey/:skykey-id", async (c) => {
  c.res.headers.set("Access-Control-Allow-Origin", "*");

  const id = c.req.param("skykey-id");

  return c.json(
    {
      name: "Sky Strife Sky Key",
      description:
        "The Sky Key is a 1 of 1 NFT that allows the holder to have limited control over the Sky Strife world.",
      image: "https://play.skystrife.xyz/public/assets/skykey.png",
      external_url: "https://play.skystrife.xyz",
      attributes: [{ trait_type: "id", value: id }],
    },
    200,
  );
});

export default app;
