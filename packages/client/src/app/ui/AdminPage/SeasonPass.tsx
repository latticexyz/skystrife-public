import { useEffect, useState } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { PromiseButton } from "../hooks/PromiseButton";
import { Hex, formatEther, parseEther, stringToHex, isAddress } from "viem";
import { DateTime, Duration } from "luxon";
import { Heading } from "../Theme/SkyStrife/Typography";
import { useBalance } from "wagmi";
import { useExternalAccount } from "../hooks/useExternalAccount";
import { Input } from "../Theme/SkyStrife/Input";
import { useSeasonPassPrice } from "../../amalgema-ui/hooks/useSeasonPassPrice";
import { useCurrentTime } from "../../amalgema-ui/hooks/useCurrentTime";

function BuySeasonPassForAddress() {
  const {
    network: { waitForTransaction },
    executeSystemWithExternalWallet,
    utils: { refreshBalance },
  } = useAmalgema();

  const { address: account } = useExternalAccount();
  const [address, setAddress] = useState<string>("");
  const now = useCurrentTime();
  const price = useSeasonPassPrice(BigInt(Math.floor(now.toSeconds())));

  if (!account) return <></>;

  return (
    <div className="border-4 p-4 rounded-lg">
      <Heading>Buy Season Pass for Address</Heading>
      <Input label="Address" value={address} setValue={setAddress} />
      <PromiseButton
        buttonType="primary"
        disabled={!isAddress(address)}
        promise={async () => {
          if (!isAddress(address)) return;

          const tx = await executeSystemWithExternalWallet({
            systemCall: "buySeasonPass",
            systemId: "Buy Season Pass",
            args: [[address as Hex], { account, value: price }],
          });
          if (tx) await waitForTransaction(tx);
          refreshBalance(account);
        }}
      >
        Mint
      </PromiseButton>
    </div>
  );
}

export function SeasonPass() {
  const { externalWorldContract, externalWalletClient } = useAmalgema();

  const [success, setSuccess] = useState(false);

  const [namespace, setNamespace] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("");
  const [symbol, setSymbol] = useState("");
  const [seasonStart, setSeasonStart] = useState(0);
  const [seasonEnd, setSeasonEnd] = useState(0);

  const [mintEnd, setMintEnd] = useState(0);
  const [mintDuration, setMintDuration] = useState(0);

  const [percentLossPerHour, setPercentLossPerHour] = useState(0);
  const [decreaseRate, setDecreaseRate] = useState(0);
  const [startingPrice, setStartingPrice] = useState(0.03);
  const [minPrice, setMinPrice] = useState(0.03);
  const [priceIncreasePercent, setPriceIncreasePercent] = useState(100);

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
          <label>Namespace</label>
          <input
            className="bg-slate-300"
            type="text"
            maxLength={14}
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
          />
        </div>
        <br />
        <div className="flex gap-x-2">
          <label>Season Number</label>
          <input
            className="bg-slate-300"
            type="text"
            maxLength={4}
            value={seasonNumber}
            onChange={(e) => setSeasonNumber(e.target.value)}
          />
        </div>
        <br />
        <div className="flex gap-x-2">
          <label>Symbol</label>
          <input
            className="bg-slate-300"
            type="text"
            maxLength={4}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
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
          <label>Buy Multiplier</label>
          <input
            className="bg-slate-300"
            type="number"
            value={priceIncreasePercent}
            onChange={(e) => setPriceIncreasePercent(Number(e.target.value))}
          />
        </div>
        {success && <div className="text-green-500">Season Pass created successfully!</div>}
        <PromiseButton
          buttonType="primary"
          className="w-[120px]"
          disabled={
            !namespace ||
            !symbol ||
            !seasonStart ||
            !seasonEnd ||
            !mintEnd ||
            !startingPrice ||
            !minPrice ||
            !priceIncreasePercent
          }
          promise={async () => {
            if (!externalWorldContract) return;
            if (!externalWalletClient?.account) return;

            await externalWorldContract.write.createNewSeasonPass(
              [
                stringToHex(namespace, { size: 14 }),
                seasonNumber,
                symbol,
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
              },
            );
            setSuccess(true);
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
              },
            );
          }}
        >
          Withdraw ETH
        </PromiseButton>
      </div>

      <BuySeasonPassForAddress />
    </div>
  );
}
