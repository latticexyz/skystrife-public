import { useAmalgema } from "../../useAmalgema";
import { Body, Caption, Heading } from "../ui/Theme/SkyStrife/Typography";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Hex, formatEther } from "viem";
import { useSeasonPassExternalWallet } from "./hooks/useSeasonPass";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PromiseButton } from "../ui/hooks/PromiseButton";
import { DateTime, Duration } from "luxon";
import { Modal } from "./Modal";
import { useMainWalletBalance } from "./hooks/useBalance";
import { SEASON_NAME } from "../../constants";
import { SeasonPassImg } from "./SeasonPassImg";
import { Has, getComponentValue } from "@latticexyz/recs";

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
    network: { publicClient, waitForTransaction },
    components: { SeasonPassConfig, SeasonPassLastSaleAt, SeasonTimes, SeasonPassSale },
    executeSystemWithExternalWallet,
  } = useAmalgema();

  const [now, setNow] = useState(DateTime.now().toSeconds());
  const [modalOpen, setModalOpen] = useState(false);

  const seasonPassSaleEntities = useEntityQuery([Has(SeasonPassSale)]);
  const seasonPassSales = seasonPassSaleEntities
    .map((entity) => getComponentValue(SeasonPassSale, entity))
    .filter((sale) => Boolean(sale))
    .sort((a, b) => Number(b?.purchasedAt) - Number(a?.purchasedAt));
  const mostRecentSale = seasonPassSales[0]!;

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
  const { nativeCurrency } = publicClient.chain;

  const canBuy = mainWalletBalance?.value && mainWalletBalance.value >= price;

  let disabledMessage = "";
  if (!canBuy) disabledMessage = "not enough funds";

  const formatEthPrice = useCallback(
    (price: bigint) => {
      return `${parseFloat(formatEther(price)).toFixed(2)} ${nativeCurrency.symbol}`;
    },
    [nativeCurrency.symbol],
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
            isOpen={modalOpen}
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
                    if (!account) return;

                    const tx = await executeSystemWithExternalWallet({
                      systemCall: "buySeasonPass",
                      args: [[account as Hex], { account, value: price }],
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
                <span className="text-ss-text-x-light">Price</span>
                <span className="font-mono">{formatEthPrice(price)}</span>
              </div>
            </div>

            <div className="h-3" />

            <Body className="text-ss-text-default">
              The Season Pass is non-transferable and can only be minted once per account.
            </Body>
          </Modal>
        ) : (
          <></>
        )}

        {seasonPassSales.length > 0 && (
          <div className="w-full">
            <div className="h-2" />

            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SeasonPassImg className="w-[50px]" />
                  <div className="flex flex-col items-start">
                    <Caption className="text-ss-text-light font-bold font-mono">Last Purchased:</Caption>
                    <Caption className="text-ss-text-light font-mono">
                      {DateTime.fromSeconds(Number(mostRecentSale.purchasedAt)).toRelative()}
                    </Caption>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
