import { Entity } from "@latticexyz/recs";
import { usePagination } from "../hooks/usePagination";
import React, { useState } from "react";
import { sleep } from "@latticexyz/utils";
import { LoadingSpinner } from "../../ui/Theme/SkyStrife/Icons/LoadingSpinner";
import { JoinModal } from "./JoinModal";

export function MatchListingContainer({
  allMatches,
  matchRowComponent,
  header,
}: {
  allMatches: Entity[];
  matchRowComponent: React.ComponentType<{ matchEntity: Entity; setViewingMatchEntity: (e: Entity) => void }>;
  header?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [viewingMatchEntity, setViewingMatchEntity] = useState<Entity | null>(null);

  const onPageChange = async (state: "start" | "done") => {
    setLoading(state === "start");
    await sleep(1);
  };
  const pageSize = 10;
  const { page, form: paginationForm } = usePagination({ totalItems: allMatches.length, pageSize, onPageChange });
  const shownMatches = allMatches.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="grow flex flex-col relative">
      <JoinModal
        isOpen={Boolean(viewingMatchEntity)}
        setIsOpen={() => setViewingMatchEntity(null)}
        matchEntity={viewingMatchEntity ?? ("0x0" as Entity)}
      />

      {header && (
        <div className="flex flex-row w-full bg-ss-bg-1 h-[48px] px-4 border-b border-ss-stroke">{header}</div>
      )}

      <div className="flex flex-row gap-x-8 w-full items-center bg-white h-[48px] px-4 text-ss-text-light text-sm uppercase border-b border-ss-stroke">
        <div className="grow min-w-[120px] text-left">Match Name</div>

        <div className="w-[100px] text-center shrink-0">Players</div>

        <div className="w-[120px] text-center shrink-0">Map</div>

        <div className="w-[100px] text-center shrink-0">Entrance Fee</div>

        <div className="w-[100px] text-center shrink-0">Reward Pool</div>

        <div className="w-[100px] text-center shrink-0"></div>
      </div>

      <div
        style={{
          height: `calc(100% - ${header ? 96 : 48}px)`,
          top: `${header ? 96 : 48}px`,
        }}
        className={`absolute left-0 overflow-y-auto w-full`}
      >
        {loading ? (
          <div className="w-full">
            <div className="mx-auto w-fit h-[240px] flex flex-col justify-around -mb-4">
              <LoadingSpinner />
            </div>
          </div>
        ) : (
          shownMatches.map((matchEntity) => {
            return React.createElement(matchRowComponent, { matchEntity, key: matchEntity, setViewingMatchEntity });
          })
        )}

        <div className="w-full">
          <div className="h-4" />
          <div className="w-fit mx-auto">{paginationForm}</div>
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

export function ViewOnlyMatchListingContainer({
  allMatches,
  matchRowComponent,
  header,
}: {
  allMatches: Entity[];
  matchRowComponent: React.ComponentType<{ matchEntity: Entity }>;
  header?: React.ReactNode;
}) {
  const pageSize = 10;
  const { page, form: paginationForm } = usePagination({ totalItems: allMatches.length, pageSize });
  const shownMatches = allMatches.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="grow flex flex-col relative">
      {header && (
        <div className="flex flex-row w-full bg-ss-bg-1 h-[48px] px-4 border-b border-ss-stroke">{header}</div>
      )}

      <div className="flex flex-row gap-x-8 w-full items-center bg-white h-[48px] px-4 text-ss-text-light text-sm uppercase border-b border-ss-stroke">
        <div className="grow min-w-[120px] text-left">Match Name</div>

        <div className="w-[120px] text-center">Date Played</div>

        <div className="w-[120px] text-center shrink-0">Map</div>

        <div className="w-[240px] text-left shrink-0">Players</div>
      </div>

      <div
        style={{
          height: `calc(100% - ${header ? 96 : 48}px)`,
          top: `${header ? 96 : 48}px`,
        }}
        className={`absolute left-0 overflow-y-auto w-full`}
      >
        {shownMatches.map((matchEntity) => {
          return React.createElement(matchRowComponent, { matchEntity, key: matchEntity });
        })}

        <div className="w-full">
          <div className="h-4" />
          <div className="w-fit mx-auto">{paginationForm}</div>
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
