import { Hex, PublicClient, parseEther } from "viem";
import { createClient as createFaucetClient } from "@latticexyz/faucet";

const MINIMUM_BALANCE = parseEther("0.01");
const DRIP_INTERVAL = 20_000;

export function drip(address: Hex, faucetServiceUrl: string, publicClient: PublicClient) {
  console.info("[Dev Faucet]: Player address -> ", address);

  try {
    console.log("creating faucet client");
    const faucet = createFaucetClient({ url: faucetServiceUrl });

    const doDrip = async () => {
      const balance = await publicClient.getBalance({ address });
      console.info(`[Dev Faucet]: Player balance -> ${balance}`);

      if (balance < MINIMUM_BALANCE) {
        console.log("dripping");
        const tx = await faucet.drip.mutate({ address });
        console.log("got drip", tx);
      }
    };

    doDrip();
    setInterval(doDrip, DRIP_INTERVAL);
  } catch (e) {
    console.error(e);
  }
}
