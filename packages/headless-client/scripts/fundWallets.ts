import { isHex, parseEther, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { generatePrivateKey } from "viem/accounts";
import { z } from "zod";
import { execa } from "execa";
import { skystrifeDebug } from "client/src/debug";
import fs from "fs";
import { supportedChains } from "client/src/mud/supportedChains";

const debug = skystrifeDebug.extend("fund-wallets");

export const env = z
  .object({
    CHAIN_ID: z.coerce.number(),
    PRIVATE_KEY: z.string().transform((val) => (val ? (isHex(val) ? val : stringToHex(val, { size: 64 })) : undefined)),
    NUM_WALLETS: z.coerce.number().positive(),
    ETH_AMOUNT: z.coerce.number().positive(),
  })
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

const chain = supportedChains.find((c) => c.id === env.CHAIN_ID);
if (!chain) throw new Error("could not find chain");

const rpcURL = chain.rpcUrls.default.http[0];

const sendingPrivateKey = env.PRIVATE_KEY;
if (!sendingPrivateKey) throw new Error("invalid private key");

for (let i = 0; i < env.NUM_WALLETS; i++) {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  const folder = `${chain.id}`;

  fs.mkdirSync(`wallets/${folder}`, { recursive: true });

  const publicKey = account.address;

  debug(`Wallet created...`);
  debug(`Private Key: ${privateKey}`);
  debug(`Address: ${publicKey}`);

  debug(`Sending ${env.ETH_AMOUNT} ETH to wallet.`);
  const amount = parseEther(env.ETH_AMOUNT.toString());
  try {
    await execa("cast", [
      "send",
      "--rpc-url",
      rpcURL,
      "--private-key",
      sendingPrivateKey,
      "--value",
      amount.toString(),
      publicKey,
    ]);
  } catch (e) {
    debug("Sending failed... Next wallet.");
    continue;
  }

  debug(`ETH sent.`);

  const filePath = `wallets/${folder}/${publicKey}.txt`;
  fs.writeFileSync(filePath, `${publicKey},${privateKey}`);

  debug(`Storing wallet at ${filePath}`);
}
