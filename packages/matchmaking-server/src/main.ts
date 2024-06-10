import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { openDb, initializeDb } from "./database";
import { Hex, parseEther, verifyMessage } from "viem";
import { createSkyStrife } from "headless-client/src/createSkyStrife";
import { createMatch } from "./createMatch";
import { getOrbBalance } from "./getOrbBalance";
import { hasSeasonPass } from "./hasSeasonPass";
import { z } from "zod";

import createDebug from "debug";
export const debug = createDebug("matchmaking-server");

const app = express();
app.use(cors());
app.use(express.json());

const env = z
  .object({
    PORT: z.string().nonempty(),
  })
  .parse(process.env);

const { PORT } = env;

app.listen(PORT, () => {
  debug(`Server is running on port ${PORT}`);
});

const skyStrife = await createSkyStrife();
await initializeDb();
if (!(await checkOrbBalance())) {
  debug("Not enough orbs to create matches");
  process.exit(1);
}

if (!hasSeasonPass(skyStrife)) {
  debug("No season pass found");
  process.exit(1);
}

interface AuthRequestBody {
  ethereum_address: Hex;
  message: string;
  signature: Hex;
}

interface ReadyUpRequestBody {
  ethereum_address: Hex;
  match_id: number;
  message: string;
  signature: Hex;
}

app.get("/healthcheck", (req, res) => {
  res.status(200).send("Server is healthy");
});

// eslint-disable-next-line @typescript-eslint/ban-types
app.post("/join", async (req: Request<{}, {}, AuthRequestBody>, res: Response) => {
  const { ethereum_address, message, signature } = req.body;

  debug("Join request received", ethereum_address);

  try {
    // Verify the signed message
    const isValid = await verifyMessage({
      message,
      signature,
      address: ethereum_address,
    });
    if (!isValid) {
      return res.status(401).send({ message: "Invalid signature" });
    }

    // Check if user is already in the pool
    const db = await openDb();
    const user = await db.get("SELECT * FROM matchmaking_pool WHERE ethereum_address = ?", [ethereum_address]);
    if (user) {
      return res.status(400).send({ message: "User already in matchmaking pool" });
    }

    await db.run("INSERT INTO matchmaking_pool (ethereum_address, joined_at, refreshed_at) VALUES (?, ?, ?)", [
      ethereum_address,
      Date.now(),
      Date.now(),
    ]);
    res.status(201).send({ message: "Joined matchmaking pool" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

// eslint-disable-next-line @typescript-eslint/ban-types
app.post("/leave", async (req: Request<{}, {}, AuthRequestBody>, res: Response) => {
  const { ethereum_address, message, signature } = req.body;

  try {
    // Verify the signed message
    const isValid = await verifyMessage({
      message,
      signature,
      address: ethereum_address,
    });
    if (!isValid) {
      return res.status(401).send({ message: "Invalid signature" });
    }

    const db = await openDb();
    const user = await db.get("SELECT * FROM matchmaking_pool WHERE ethereum_address = ?", [ethereum_address]);

    if (!user) {
      return res.status(404).send({ message: "User not found in matchmaking pool" });
    }

    await db.run("DELETE FROM matchmaking_pool WHERE ethereum_address = ?", [ethereum_address]);
    res.status(200).send({ message: "Left matchmaking pool" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/pool", async (req: Request, res: Response) => {
  if (!(await checkOrbBalance())) {
    return res.status(500).send({ message: "Internal server error" });
  }

  const db = await openDb();
  const users = await db.all("SELECT * FROM matchmaking_pool");
  res.status(200).send(users);
});

app.get("/status/:ethereum_address", async (req: Request, res: Response) => {
  const { ethereum_address } = req.params;

  try {
    const db = await openDb();

    // Check if the user is in the matchmaking pool
    const poolUser = await db.get("SELECT * FROM matchmaking_pool WHERE ethereum_address = ? LIMIT 1", [
      ethereum_address,
    ]);
    if (poolUser) {
      await db.run("UPDATE matchmaking_pool SET refreshed_at = ? WHERE ethereum_address = ?", [
        Date.now(),
        ethereum_address,
      ]);

      return res.status(200).send({ status: "in_pool", details: poolUser });
    }

    // Check if the user is in a pending match
    const pendingMatch = await db.get(
      "SELECT * FROM pending_matches WHERE user1 = ? OR user2 = ? OR user3 = ? OR user4 = ? LIMIT 1",
      [ethereum_address, ethereum_address, ethereum_address, ethereum_address],
    );
    if (pendingMatch) {
      return res.status(200).send({
        status: "pending_match",
        match_id: pendingMatch.id,
        details: pendingMatch,
        expiryTime: pendingMatch.created_at + 1000 * 60,
      });
    }

    // Check if the user is in a confirmed match
    const confirmedMatch = await db.get(
      "SELECT * FROM confirmed_matches WHERE (user1 = ? OR user2 = ? OR user3 = ? OR user4 = ?) AND created_at > ? LIMIT 1",
      [ethereum_address, ethereum_address, ethereum_address, ethereum_address, Date.now() - 1000 * 60],
    );
    if (confirmedMatch) {
      return res.status(200).send({
        status: "confirmed_match",
        match_id: confirmedMatch.id,
        details: confirmedMatch,
      });
    }

    // If the user is not found in any of the tables
    res.status(200).send({ status: "idle" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

// eslint-disable-next-line @typescript-eslint/ban-types
app.post("/ready-up", async (req: Request<{}, {}, ReadyUpRequestBody>, res: Response) => {
  const { ethereum_address, match_id, message, signature } = req.body;

  try {
    // Verify the signed message
    const isValid = await verifyMessage({
      message,
      signature,
      address: ethereum_address,
    });
    if (!isValid) {
      return res.status(401).send({ message: "Invalid signature" });
    }

    const db = await openDb();
    const pendingMatch = await db.get("SELECT * FROM pending_matches WHERE id = ?", [match_id]);

    if (!pendingMatch) {
      return res.status(404).send({ message: "Pending match not found" });
    }

    // Check if the user is part of the pending match
    const userColumn = ["user1", "user2", "user3", "user4"].find((col) => {
      return pendingMatch[col] === ethereum_address;
    });
    if (!userColumn) {
      return res.status(403).send({ message: "User not part of this pending match" });
    }

    // Update the user's confirmation status
    const confirmationColumn = `${userColumn}_confirmed`;
    await db.run(`UPDATE pending_matches SET ${confirmationColumn} = 1 WHERE id = ?`, [match_id]);

    res.status(200).send({ message: "User ready status updated" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

async function createPendingMatches() {
  if (!(await checkOrbBalance())) return;

  const db = await openDb();
  const users = await db.all("SELECT * FROM matchmaking_pool ORDER BY joined_at ASC LIMIT 4");

  if (users.length >= 4) {
    const [user1, user2, user3, user4] = users;

    debug(
      "Creating pending match with users:",
      user1.ethereum_address,
      user2.ethereum_address,
      user3.ethereum_address,
      user4.ethereum_address,
    );

    await db.run(
      `INSERT INTO pending_matches (
        user1, user2, user3, user4, user1_confirmed, user2_confirmed, user3_confirmed, user4_confirmed, created_at
      ) VALUES (?, ?, ?, ?, 0, 0, 0, 0, ?)`,
      [user1.ethereum_address, user2.ethereum_address, user3.ethereum_address, user4.ethereum_address, Date.now()],
    );

    await db.run("DELETE FROM matchmaking_pool WHERE ethereum_address IN (?, ?, ?, ?)", [
      user1.ethereum_address,
      user2.ethereum_address,
      user3.ethereum_address,
      user4.ethereum_address,
    ]);

    debug(
      "Pending match created with users:",
      user1.ethereum_address,
      user2.ethereum_address,
      user3.ethereum_address,
      user4.ethereum_address,
    );
  }
}

async function checkPendingMatches() {
  if (!(await checkOrbBalance())) return;

  const db = await openDb();
  const pendingMatches = await db.all("SELECT * FROM pending_matches");

  for (const match of pendingMatches) {
    const allConfirmed =
      match.user1_confirmed && match.user2_confirmed && match.user3_confirmed && match.user4_confirmed;

    if (allConfirmed) {
      // All users have confirmed, proceed to create the actual match
      debug("All users confirmed for match:", match.id);
      try {
        const matchEntity = await createMatch(skyStrife, "Vortex", `Play Now (${match.id})`);

        await db.run(
          `INSERT INTO confirmed_matches (
          match_entity, user1, user2, user3, user4, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
          [matchEntity, match.user1, match.user2, match.user3, match.user4, Date.now()],
        );

        // Delete the pending match
        await db.run("DELETE FROM pending_matches WHERE id = ?", [match.id]);

        debug("Created confirmed match:", match.id);
      } catch (error) {
        debug("Failed to create confirmed match:", match.id, error);
      }
    }
  }
}

async function checkExpiredPendingMatches() {
  const db = await openDb();
  const oneMinuteAgo = Date.now() - 60 * 1000;
  const expiredMatches = await db.all("SELECT * FROM pending_matches WHERE created_at < ?", [oneMinuteAgo]);

  for (const match of expiredMatches) {
    const usersToReturn = [];

    if (match.user1_confirmed) usersToReturn.push(match.user1);
    if (match.user2_confirmed) usersToReturn.push(match.user2);
    if (match.user3_confirmed) usersToReturn.push(match.user3);
    if (match.user4_confirmed) usersToReturn.push(match.user4);

    // Delete the expired pending match
    await db.run("DELETE FROM pending_matches WHERE id = ?", [match.id]);

    // Return confirmed users back to the matchmaking pool
    for (const user of usersToReturn) {
      await db.run("INSERT INTO matchmaking_pool (ethereum_address, joined_at, refreshed_at) VALUES (?, ?, ?)", [
        user,
        Date.now(),
        Date.now(),
      ]);
    }

    debug("Expired pending match deleted and users returned to pool:", match.id, usersToReturn);
  }
}

async function kickInactiveUsersOutOfPool() {
  const db = await openDb();
  const inactiveUsers = await db.all("SELECT * FROM matchmaking_pool WHERE refreshed_at < ?", [Date.now() - 1000 * 30]);
  for (const user of inactiveUsers) {
    debug("Kicking inactive user out of pool:", user.ethereum_address);
    await db.run("DELETE FROM matchmaking_pool WHERE ethereum_address = ?", [user.ethereum_address]);
  }
}

async function checkOrbBalance() {
  const db = await openDb();
  const orbBalance = getOrbBalance(skyStrife);
  if (orbBalance < parseEther("100")) {
    debug("Not enough orbs to create match");
    // remove all pending matches
    await db.run("DELETE FROM pending_matches");

    // remove all users from the matchmaking pool
    await db.run("DELETE FROM matchmaking_pool");

    return false;
  }

  return true;
}

setInterval(async () => {
  await createPendingMatches();
  await checkPendingMatches();
  await checkExpiredPendingMatches();
  await kickInactiveUsersOutOfPool();
}, 5_000);
