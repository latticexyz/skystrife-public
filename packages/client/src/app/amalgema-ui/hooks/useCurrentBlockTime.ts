import { useEffect, useState } from "react";
import { useAmalgema } from "../../../useAmalgema";

export function useCurrentBlockTime() {
  const networkLayer = useAmalgema();
  const {
    network: { publicClient },
  } = networkLayer;
  const [currentBlockTime, setCurrentBlockTime] = useState(0n);

  useEffect(() => {
    return publicClient.watchBlockNumber({
      onBlockNumber: async (blockNumber) => {
        const blockDetails = await publicClient.getBlock({
          blockNumber,
        });

        setCurrentBlockTime(blockDetails.timestamp);
      },
    });
  }, [networkLayer, publicClient]);

  return currentBlockTime;
}
