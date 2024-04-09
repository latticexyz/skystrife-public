import { Entity, Has, defineSystem, getComponentValue } from "@latticexyz/recs";
import { TextChannel } from "discord.js";
import { createSkyStrife } from "headless-client/src/createSkyStrife";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { formatAddress } from "client/src/layers/Headless/utils";
import { Hex, formatEther } from "viem";
import { toEthAddress } from "@latticexyz/utils";
import { addressToEntityID } from "client/src/mud/setupNetwork";

export async function createSeasonPassNotifier(
  skyStrife: Awaited<ReturnType<typeof createSkyStrife>>,
  notifChannel: TextChannel,
) {
  const {
    networkLayer: {
      world,
      components: { SeasonPassSale, Name },
      network: {
        networkConfig: { chain },
      },
    },
  } = skyStrife;

  defineSystem(
    world,
    [Has(SeasonPassSale)],
    ({ entity }) => {
      const saleData = getComponentValue(SeasonPassSale, entity);
      if (!saleData) return;

      const { buyer } = decodeEntity({ buyer: "address", tokenId: "uint256" }, entity);
      const { price } = saleData;

      const name =
        getComponentValue(Name, addressToEntityID(buyer))?.value ?? formatAddress(toEthAddress(buyer) as Hex);

      const blockExplorer = chain?.blockExplorers?.default?.url;
      const nameContent = blockExplorer ? `[${name}](${blockExplorer}/address/${toEthAddress(buyer)})` : name;

      const msgContent = `🎫 ${nameContent} has purchased a Season Pass for ${parseFloat(formatEther(price)).toFixed(6)}ETH! 🎫`;

      notifChannel.send({
        content: msgContent,
      });
    },
    { runOnInit: false },
  );
}
