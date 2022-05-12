import { useAmalgema } from "../../useAmalgema";
import { Body, Caption, Heading, Link } from "../ui/Theme/SkyStrife/Typography";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Hex, formatEther } from "viem";
import { useSeasonPassExternalWallet } from "./hooks/useSeasonPass";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useComponentValue } from "@latticexyz/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PromiseButton } from "../ui/hooks/PromiseButton";
import { DateTime, Duration } from "luxon";
import { Modal } from "./Modal";
import { useMainWalletBalance } from "./hooks/useMainWalletBalance";
import { SEASON_NAME } from "../../constants";
import { SeasonPassImg } from "./SeasonPassImg";

function useSeasonPassPrice(atTime: bigint) {
  const {
    components: { SeasonPassConfig, SeasonPassLastSaleAt },
  } = useAmalgema();

  const config = useComponentValue(SeasonPassConfig, singletonEntity);
  const lastSaleAt = useComponentValue(SeasonPassLastSaleAt, singletonEntity);

  const price = useMemo(() => {
    if (!config || !lastSaleAt) return 0n;

    const { startingPrice, rate, minPrice } = config;
    const timeSinceLastSale = atTime - lastSaleAt.lastSaleAt;
    const decrease = ((startingPrice * rate) / 10_000_000_000n) * timeSinceLastSale;

    if (startingPrice > decrease) {
      const newPrice = startingPrice - decrease;
      if (newPrice > minPrice) {
        return startingPrice - decrease;
      } else {
        return minPrice;
      }
    } else {
      return minPrice;
    }
  }, [config, lastSaleAt, atTime]);

  return price;
}

export function SeasonPass({ account }: { account?: Hex }) {
  const {
    externalWorldContract,
    network: { publicClient, waitForTransaction },
    components: { SeasonPassConfig, SeasonPassLastSaleAt, SeasonTimes },
  } = useAmalgema();

  const [now, setNow] = useState(DateTime.now().toSeconds());
  const [modalOpen, setModalOpen] = useState(false);

  const [enableSlippage, setEnableSlippage] = useState(false);
  const [slippage, setSlippage] = useState(10); // 10%

  useEffect(() => {
    if (!enableSlippage) return;

    setSlippage(10);
  }, [enableSlippage]);

  const [enlarge, setEnlarge] = useState(false);
  useEffect(() => {
    const sub = SeasonPassLastSaleAt.update$.subscribe(() => {
      setEnlarge(true);
      setTimeout(() => {
        setEnlarge(false);
      }, 100);
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(DateTime.now().toSeconds());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const seasonPassConfig = useComponentValue(SeasonPassConfig, singletonEntity);
  const mintCutoff = Number(seasonPassConfig?.mintCutoff ?? 0n);
  const secondsUntilMintCutoff = mintCutoff - now;

  const seasonTimes = useComponentValue(SeasonTimes, singletonEntity);
  const secondsUntilSeasonEnds = Number(seasonTimes?.seasonEnd ?? 0n) - now;
  const timeUntilMintCutoff = Duration.fromObject({ seconds: secondsUntilMintCutoff });
  const timeUntilSeasonEnds = Duration.fromObject({ seconds: secondsUntilSeasonEnds });

  const mainWalletBalance = useMainWalletBalance();

  const seasonStart = DateTime.fromSeconds(Number(seasonTimes?.seasonStart ?? 0n));
  const seasonEnd = DateTime.fromSeconds(Number(seasonTimes?.seasonEnd ?? 0n));

  const hasSeasonPass = useSeasonPassExternalWallet();
  const price = useSeasonPassPrice(BigInt(Math.floor(now)));
  const priceWithSlippage = price + (enableSlippage ? (price * BigInt(slippage)) / 100n : 0n);
  const { nativeCurrency } = publicClient.chain;

  const canBuy = mainWalletBalance?.value && mainWalletBalance.value >= priceWithSlippage;

  let disabledMessage = "";
  if (!canBuy) disabledMessage = "not enough funds";

  const formatEthPrice = useCallback(
    (price: bigint) => {
      return `${parseFloat(formatEther(price)).toFixed(6)} ${nativeCurrency.symbol}`;
    },
    [nativeCurrency.symbol]
  );

  return secondsUntilMintCutoff > 0 ? (
    <div className="flex flex-col items-start self-stretch rounded-sm border border-ss-stroke bg-ss-bg-0">
      <div className="flex flex-col justify-center items-center self-stretch py-3 px-4 border-b border-ss-stroke">
        <div className="flex flex-col justify-center items-center">
          <Caption className="text-ss-text-x-light leading-6">Minting ends in:</Caption>
          <div className="text-ss-text-default text-[2rem] font-medium font-mono leading-8 uppercase">
            {timeUntilMintCutoff.toFormat("dd:hh:mm:ss")}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 self-stretch p-4">
        {hasSeasonPass ? (
          <div className="flex items-center gap-3 self-stretch">
            <SeasonPassImg className="w-[100px]" />
            <div className="frame_530 flex flex-col items-start">
              <Heading className="text-ss-text-default"> Season Pass</Heading>
              <Caption className="text-ss-text-light">You have the Season Pass for this Season!</Caption>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 self-stretch">
            <SeasonPassImg className="w-[100px]" colored={false} />
            <div className="frame_530 flex flex-col items-start">
              <Heading className="text-ss-text-default">Season Pass</Heading>
              <Caption className="text-ss-text-light">
                Mint a Season Pass to gain access exclusive perks and features!
              </Caption>
            </div>
          </div>
        )}

        {!hasSeasonPass ? (
          <Modal
            open={modalOpen}
            setOpen={setModalOpen}
            title={`Season Pass (${SEASON_NAME})`}
            trigger={
              <Button
                style={{
                  transition: "all 0.1s ease-in-out",
                  transform: enlarge ? "scale(1.2)" : "scale(1)",
                }}
                buttonType="primary"
                size="md"
                className="w-full"
                disabled={!account}
              >
                mint - {formatEthPrice(price)}
              </Button>
            }
            footer={
              <div className="flex space-x-4 w-full">
                <Button onClick={() => setModalOpen(false)} buttonType="tertiary" className="w-full">
                  cancel
                </Button>
                <PromiseButton
                  disabled={!canBuy}
                  promise={async () => {
                    // we send double the price to account for other purchases occuring while the user is sending their tx
                    // the difference will be refunded
                    const tx = await externalWorldContract?.write.buySeasonPass([account as Hex], {
                      value: priceWithSlippage,
                    });
                    if (tx) await waitForTransaction(tx);
                  }}
                  buttonType="secondary"
                  size="md"
                  className="w-full"
                >
                  {canBuy ? `mint - ${formatEthPrice(price)}` : disabledMessage}
                </PromiseButton>
              </div>
            }
          >
            <div className="flex space-x-6">
              <div className="flex flex-col items-center justify-around border border-ss-stroke bg-white w-fit p-2 rounded-md">
                <SeasonPassImg className="w-[180px]" />
              </div>

              <div className="grow flex flex-col justify-between">
                <div className="flex justify-between items-center px-3 py-2 bg-ss-bg-2">
                  <span className="text-ss-text-x-light">Season Starts</span>
                  <span>{seasonStart.toFormat("LLL dd")}</span>
                </div>

                <div className="flex justify-between items-center px-3 py-2 bg-ss-bg-2">
                  <span className="text-ss-text-x-light">Minting Ends</span>
                  <span>{DateTime.fromSeconds(mintCutoff).toFormat("LLL dd")}</span>
                </div>

                <div className="flex justify-between items-center px-3 py-2 bg-ss-bg-2">
                  <span className="text-ss-text-x-light">Season Ends</span>
                  <span>{seasonEnd.toFormat("LLL dd")}</span>
                </div>
              </div>
            </div>

            <div className="h-8" />

            <Body className="text-ss-text-default">
              The <span className="font-bold">Sky Strife Season Pass</span>, for {SEASON_NAME}, gives you access to
              exclusive perks and features:
            </Body>

            <ul className="list-disc list-inside text-ss-text-light p-4">
              <li>Access to exclusive free matches summoned from the Sky Pool.</li>
              <li>Unlock additional features for creating matches.</li>
              <ul className="pl-8 list-disc list-inside">
                <li>Create private matches with a custom access list.</li>
                <li>Set entrance fees and custom rewards.</li>
              </ul>
              <li>Exclusive maps from the current season.</li>
            </ul>

            <div className="h-4" />

            <div className="flex w-full space-x-4">
              <div className="flex justify-between items-center px-3 py-2 bg-ss-bg-2 grow">
                <span className="text-ss-text-x-light">Starting Price</span>
                <span>0.005 ETH</span>
              </div>

              <div className="flex justify-between items-center px-3 py-2 bg-ss-bg-2 grow">
                <span className="text-ss-text-x-light">Current Price</span>
                <span>{formatEthPrice(price)}</span>
              </div>
            </div>

            <div className="h-3" />

            <Body className="text-ss-text-default">
              The Season Pass price increases with every sale, then decreases over time according to Dutch Auction
              rules. Read about it <Link>here</Link>.
            </Body>

            <div className="h-4" />

            <Body className="text-ss-text-default">
              The Season Pass is non-transferable and can only be minted once per account.
            </Body>

            <div className="h-4" />

            <div>
              <div className="flex items-baseline gap-3">
                <label htmlFor="slippage-checkbox">
                  <Body className="text-ss-text-default">
                    Enable Slippage Protection <br /> (send more ETH than needed in case the price increases while your
                    transaction is confirming)
                  </Body>
                </label>
                <input
                  id="slippage-checkbox"
                  type="checkbox"
                  checked={enableSlippage}
                  onChange={(e) => setEnableSlippage(e.target.checked)}
                />
              </div>

              {enableSlippage && (
                <div className="flex items-center gap-3">
                  <div className="h-4" />

                  <input
                    type="range"
                    min={10}
                    max={40}
                    value={slippage}
                    onChange={(e) => setSlippage(Number(e.target.value))}
                  />
                  <Body className="text-ss-text-default">
                    {slippage}% - Send {formatEthPrice((price * (BigInt(slippage) + 100n)) / 100n)} (excess ETH will be
                    refunded)
                  </Body>
                </div>
              )}
            </div>
          </Modal>
        ) : (
          <div className="mx-auto text-ss-text-light">Current Price: {formatEthPrice(price)}</div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-start self-stretch rounded-sm border border-ss-stroke bg-ss-bg-0">
      <div className="flex flex-col justify-center items-center self-stretch py-3 px-4 border-b border-ss-stroke">
        <div className="flex flex-col justify-center items-center">
          <Caption className="text-ss-text-x-light leading-6">{SEASON_NAME} ends in:</Caption>
          <div className="text-ss-text-default text-[2rem] font-medium font-mono leading-8">
            {timeUntilSeasonEnds.toFormat("dd:hh:mm:ss")}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 self-stretch p-4">
        {hasSeasonPass ? (
          <div className="flex items-center gap-3 self-stretch">
            <SeasonPassImg className="w-[100px]" />
            <div className="frame_530 flex flex-col items-start">
              <Heading className="text-ss-text-default">Season Pass</Heading>
              <Caption className="text-ss-text-light">
                Minting has ended. You are a Season Pass holder this season!
              </Caption>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 self-stretch">
            <SeasonPassImg className="w-[100px]" colored={false} />
            <div className="frame_530 flex flex-col items-start">
              <Heading className="text-ss-text-default">Season Pass</Heading>
              <Caption className="text-ss-text-light">
                Minting has ended. You are not a Season Pass holder this season.
              </Caption>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
