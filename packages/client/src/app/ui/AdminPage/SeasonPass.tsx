import { useEffect, useState } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { PromiseButton } from "../hooks/PromiseButton";
import { formatEther, parseEther, stringToHex } from "viem";
import { DateTime, Duration } from "luxon";
import { Heading } from "../Theme/SkyStrife/Typography";
import { useBalance } from "wagmi";
import { useExternalAccount } from "../hooks/useExternalAccount";

export function SeasonPass() {
  const { externalWorldContract, externalWalletClient } = useAmalgema();

  const [name, setName] = useState("");
  const [seasonStart, setSeasonStart] = useState(0);
  const [seasonEnd, setSeasonEnd] = useState(0);

  const [mintEnd, setMintEnd] = useState(0);
  const [mintDuration, setMintDuration] = useState(0);

  const [percentLossPerHour, setPercentLossPerHour] = useState(0);
  const [decreaseRate, setDecreaseRate] = useState(0);
  const [startingPrice, setStartingPrice] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [priceIncreasePercent, setPriceIncreasePercent] = useState(0);

  useEffect(() => {
    if (mintDuration) {
      setMintEnd(seasonStart + mintDuration);
    }
  }, [mintDuration, seasonStart]);

  useEffect(() => {
    if (!percentLossPerHour) return;

    const lossRate = percentLossPerHour / 100;
    const percentLossPerSecond = lossRate / 3600;
    const convertedToContractDenominator = percentLossPerSecond * 10 ** 10;
    setDecreaseRate(Math.round(convertedToContractDenominator));
  }, [percentLossPerHour]);

  const [ethToWithdraw, setEthToWithdraw] = useState(0);
  const { address: externalAddress } = useExternalAccount();

  const nowSeconds = Math.floor(DateTime.now().toSeconds());

  const { data: worldBalance } = useBalance({
    address: externalWorldContract?.address,
  });

  return (
    <div className="flex gap-x-8">
      <div className="flex flex-col w-[400px] max-auto h-fit border-4">
        <div
          className="
          bg-red-500
          text-white
          text-center
          text-2xl
          font-bold
          p-2
          border-b-4
        "
        >
          WARNING: Creating this Season Pass will require a client deploy to update the UI. Go to extraTables.ts and
          change SEASON_PASS_NAMESPACE to the name you chose here. The name does not matter as long as it is unique.
        </div>
        <div className="flex gap-x-2">
          <label>Name</label>
          <input
            className="bg-slate-300"
            type="text"
            maxLength={14}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <br />
        <div className="flex gap-x-2">
          <label>Season Start</label>
          <input
            className="bg-slate-300"
            type="number"
            value={seasonStart}
            onChange={(e) => setSeasonStart(Number(e.target.value))}
          />
        </div>
        {DateTime.fromSeconds(seasonStart).toUTC().toFormat("yyyy-MM-dd HH:mm:ss")}
        <div className="flex gap-x-2">
          <label>Season End</label>
          <input
            className="bg-slate-300"
            type="number"
            value={seasonEnd}
            onChange={(e) => setSeasonEnd(Number(e.target.value))}
          />
        </div>
        {DateTime.fromSeconds(seasonEnd).toUTC().toFormat("yyyy-MM-dd HH:mm:ss")}
        <br />
        <br />
        <div className="flex gap-x-2">
          <label>Mint Duration</label>
          <input
            className="bg-slate-300"
            type="number"
            value={mintDuration}
            onChange={(e) => setMintDuration(Number(e.target.value))}
          />
        </div>
        {Duration.fromMillis(mintDuration * 1000).toFormat("hh:mm:ss")}
        <div className="flex gap-x-2">
          <label>Mint End</label>
          <input
            className="bg-slate-300"
            type="number"
            value={mintEnd}
            onChange={(e) => setMintEnd(Number(e.target.value))}
          />
        </div>
        {DateTime.fromSeconds(mintEnd).toUTC().toFormat("yyyy-MM-dd HH:mm:ss")}
        <br />
        <br />
        <div className="flex gap-x-2">
          <label>Percent Loss Per Hour</label>
          <input
            className="bg-slate-300"
            type="number"
            value={percentLossPerHour}
            onChange={(e) => setPercentLossPerHour(Number(e.target.value))}
          />
        </div>
        <div className="flex gap-x-2">
          <label>Decrease Rate</label>
          <input
            className="bg-slate-300"
            type="number"
            value={decreaseRate}
            onChange={(e) => setDecreaseRate(Number(e.target.value))}
          />
        </div>
        <div className="flex gap-x-2">
          <label>Starting Price</label>
          <input
            className="bg-slate-300"
            type="number"
            value={startingPrice}
            onChange={(e) => setStartingPrice(Number(e.target.value))}
          />
        </div>
        <div className="flex gap-x-2">
          <label>Min Price</label>
          <input
            className="bg-slate-300"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
          />
        </div>
        <div className="flex gap-x-2">
          <label>Price Increase Percent</label>
          <input
            className="bg-slate-300"
            type="number"
            value={priceIncreasePercent}
            onChange={(e) => setPriceIncreasePercent(Number(e.target.value))}
          />
        </div>
        <PromiseButton
          buttonType="primary"
          className="w-[120px]"
          disabled={
            !name ||
            !seasonStart ||
            !seasonEnd ||
            !mintEnd ||
            !decreaseRate ||
            !startingPrice ||
            !minPrice ||
            !priceIncreasePercent
          }
          promise={async () => {
            if (!externalWorldContract) return;
            if (!externalWalletClient?.account) return;

            await externalWorldContract.write.createNewSeasonPass(
              [
                stringToHex(name, { size: 14 }),
                BigInt(seasonStart),
                BigInt(seasonEnd),
                BigInt(mintEnd),
                BigInt(decreaseRate),
                parseEther(startingPrice.toString()),
                parseEther(minPrice.toString()),
                BigInt(priceIncreasePercent),
              ],
              {
                account: externalWalletClient.account,
              }
            );
          }}
        >
          Create Pass
        </PromiseButton>
        Now Epoch: {nowSeconds}
      </div>

      <div className="border-4">
        <Heading>Withdraw ETH</Heading>
        <div>World Balance: {formatEther(worldBalance?.value ?? 0n)}</div>
        <div className="flex gap-x-2">
          <label>ETH to Withdraw</label>
          <input
            className="bg-slate-300"
            type="number"
            value={ethToWithdraw}
            onChange={(e) => setEthToWithdraw(Number(e.target.value))}
          />
        </div>

        <PromiseButton
          buttonType="primary"
          className="w-[120px]"
          disabled={!ethToWithdraw}
          promise={async () => {
            if (!externalWorldContract || !externalAddress) return;
            if (!externalWalletClient?.account) return;

            await externalWorldContract.write.withdrawEth(
              [externalAddress, parseEther(ethToWithdraw.toString(), "wei")],
              {
                account: externalWalletClient.account,
              }
            );
          }}
        >
          Withdraw ETH
        </PromiseButton>
      </div>
    </div>
  );
}
