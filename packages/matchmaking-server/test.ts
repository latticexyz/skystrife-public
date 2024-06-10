import axios from "axios";
import { Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount, signMessage } from "viem/accounts";
import { cleanDb } from "./src/database";

const serverUrl = "http://localhost:5201";

interface User {
  ethereum_address: Hex;
  message: string;
  signature: string;
  private_key: Hex;
}

interface StatusResponse {
  status: string;
  match_id?: number;
  details?: unknown;
}

async function generateWalletAndSignMessage(message: string): Promise<User> {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const ethereum_address = account.address;

  const signature = await signMessage({
    message,
    privateKey,
  });

  return {
    private_key: privateKey,
    ethereum_address,
    message,
    signature,
  };
}

async function joinMatchmakingPool(user: User): Promise<void> {
  try {
    const response = await axios.post(`${serverUrl}/join`, user);
    console.log(`User ${user.ethereum_address} joined:`, response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Error joining user ${user.ethereum_address}:`,
        error.response ? error.response.data : error.message,
      );
    } else {
      console.error(`Unexpected error joining user ${user.ethereum_address}:`, error);
    }
  }
}

async function checkStatus(ethereum_address: string): Promise<StatusResponse> {
  try {
    const response = await axios.get(`${serverUrl}/status/${ethereum_address}`);
    console.log(`Status for ${ethereum_address}:`, response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Error checking status for ${ethereum_address}:`,
        error.response ? error.response.data : error.message,
      );
    } else {
      console.error(`Unexpected error checking status for ${ethereum_address}:`, error);
    }
    throw error;
  }
}

async function readyUp(user: User, match_id: number): Promise<void> {
  try {
    const message = `Ready up for match ${match_id}`;
    const signature = await signMessage({
      message,
      privateKey: user.private_key,
    });
    const response = await axios.post(`${serverUrl}/ready-up`, {
      ethereum_address: user.ethereum_address,
      match_id,
      message,
      signature,
    });
    console.log(`User ${user.ethereum_address} ready up:`, response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Error readying up user ${user.ethereum_address}:`,
        error.response ? error.response.data : error.message,
      );
    } else {
      console.error(`Unexpected error readying up user ${user.ethereum_address}:`, error);
    }
  }
}

async function main(): Promise<void> {
  // Generate 4 users
  const users: User[] = await Promise.all([
    generateWalletAndSignMessage("Join matchmaking pool"),
    generateWalletAndSignMessage("Join matchmaking pool"),
    generateWalletAndSignMessage("Join matchmaking pool"),
    // generateWalletAndSignMessage("Join matchmaking pool"),
  ]);

  // Join matchmaking pool
  for (const user of users) {
    await joinMatchmakingPool(user);
  }

  // Wait for a few seconds to allow the server to process matches
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Ready up each user
  for (const user of users) {
    const statusResponse = await checkStatus(user.ethereum_address);
    console.log(`Status for ${user.ethereum_address}:`, statusResponse);

    if (statusResponse.status === "pending_match" && statusResponse.match_id !== undefined) {
      console.log(`User ${user.ethereum_address} readying up...`);
      const match_id = statusResponse.match_id;
      await readyUp(user, match_id);
    }
  }

  // Wait for a few seconds to allow the server to confirm matches
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Check the status of each user again
  await Promise.all(users.map((user) => checkStatus(user.ethereum_address)));
}

main().catch(console.error);
