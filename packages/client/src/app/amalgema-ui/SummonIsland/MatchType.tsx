import { twMerge } from "tailwind-merge";
import { Body, OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { Hex, isAddress } from "viem";
import { useAmalgema } from "../../../useAmalgema";
import { useEffect, useState } from "react";
import { useEntityQuery } from "@latticexyz/react";
import { Has, getComponentValueStrict } from "@latticexyz/recs";
import { reject, times, toLower } from "lodash";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import { CrossIcon } from "../../ui/Theme/CrossIcon";
import { Tooltip } from "react-tooltip";
import { Checkbox } from "../../ui/Theme/SkyStrife/Checkbox";
import { toEthAddress } from "@latticexyz/utils";
import { SeasonPassIcon } from "../SeasonPassIcon";
import { RemainingPrivateMatches } from "../SeasonPass";

function WorldSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 17.5C11.6625 17.4999 13.2779 16.9477 14.5925 15.93C15.9072 14.9124 16.8466 13.4869 17.2633 11.8775M10 17.5C8.33751 17.4999 6.72212 16.9477 5.40748 15.93C4.09284 14.9124 3.1534 13.4869 2.73667 11.8775M10 17.5C12.0708 17.5 13.75 14.1417 13.75 10C13.75 5.85833 12.0708 2.5 10 2.5M10 17.5C7.92917 17.5 6.25 14.1417 6.25 10C6.25 5.85833 7.92917 2.5 10 2.5M17.2633 11.8775C17.4175 11.2775 17.5 10.6483 17.5 10C17.5021 8.71009 17.1699 7.44166 16.5358 6.31833M17.2633 11.8775C15.041 13.1095 12.541 13.754 10 13.75C7.365 13.75 4.88917 13.0708 2.73667 11.8775M2.73667 11.8775C2.57896 11.2641 2.49944 10.6333 2.5 10C2.5 8.6625 2.85 7.40583 3.46417 6.31833M10 2.5C11.3302 2.49945 12.6366 2.8528 13.7852 3.5238C14.9337 4.19481 15.8831 5.15931 16.5358 6.31833M10 2.5C8.6698 2.49945 7.3634 2.8528 6.21484 3.5238C5.06628 4.19481 4.11692 5.15931 3.46417 6.31833M16.5358 6.31833C14.7214 7.88994 12.4004 8.75345 10 8.75C7.50167 8.75 5.21667 7.83333 3.46417 6.31833"
        stroke="#25241D"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.4999 16.5007L12.1691 12.1698M12.1691 12.1698C13.3412 10.9977 13.9997 9.4079 13.9997 7.75023C13.9997 6.09257 13.3412 4.5028 12.1691 3.33065C10.9969 2.1585 9.40717 1.5 7.7495 1.5C6.09184 1.5 4.50207 2.1585 3.32992 3.33065C2.15777 4.5028 1.49927 6.09257 1.49927 7.75023C1.49927 9.4079 2.15777 10.9977 3.32992 12.1698C4.50207 13.342 6.09184 14.0005 7.7495 14.0005C9.40717 14.0005 10.9969 13.342 12.1691 12.1698Z"
        stroke="#25241D"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MatchType({
  matchType,
  setMatchType,
  levelId,
  allowedAddresses,
  setAllowedAddresses,
  hasSeasonPass,
}: {
  matchType: "public" | "private" | "season-pass";
  setMatchType: (matchType: "public" | "private" | "season-pass") => void;
  allowedAddresses: string[];
  setAllowedAddresses: (allowedAddresses: string[]) => void;
  levelId: Hex;
  hasSeasonPass: boolean;
}) {
  const {
    components: { Name },
    utils: { getLevelSpawns },
    externalWalletClient,
  } = useAmalgema();

  const userAddress = toLower(externalWalletClient?.account?.address) ?? "";

  useEffect(() => {
    if (matchType === "public") {
      setAllowedAddresses([]);
    } else if (matchType === "private") {
      setAllowedAddresses([userAddress]);
    }
  }, [matchType, setAllowedAddresses, userAddress]);

  const [searchInput, setSearchInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const allRegisteredAddressEntities = useEntityQuery([Has(Name)]);
  const allAddresses = allRegisteredAddressEntities.map((addressEntity) => toEthAddress(addressEntity));
  const allNames = allRegisteredAddressEntities.map((player) => getComponentValueStrict(Name, player).value);
  const nameToAddress = allNames.reduce(
    (acc, name, index) => {
      acc[name] = allAddresses[index];
      return acc;
    },
    {} as Record<string, string>,
  );

  const allSearchOptions = reject(
    [...allNames, ...allAddresses],
    (addressOrName) =>
      allowedAddresses.includes(addressOrName) || allowedAddresses.includes(nameToAddress[addressOrName]),
  );

  const numPlayers = getLevelSpawns(levelId).length;

  const addAllowedAddress = (address: string) => {
    if (allowedAddresses.includes(address)) {
      return;
    }
    setAllowedAddresses([...allowedAddresses, address]);
  };

  const addSearchInput = () => {
    const address = nameToAddress[searchInput] ?? searchInput;
    if (!isAddress(address)) return;

    addAllowedAddress(address);
    setSearchInput("");
    setFilteredSuggestions([]);
  };

  return (
    <div>
      <OverlineSmall className="text-ss-text-x-light">Match type</OverlineSmall>
      <Body className="text-ss-default">Select the type of match you would like to create.</Body>

      <div className="h-4" />

      <div className="flex flex-row">
        <div
          onClick={() => setMatchType("public")}
          className={twMerge(
            "flex flex-col items-center justify-around w-full h-[128px] rounded-md",
            "border border-[#DDDAD0] bg-white hover:border-[#1A6CBC] hover:bg-blue-300/30",
            matchType === "public" && "border-[#1A6CBC] bg-blue-300/30",
          )}
        >
          <div className="flex flex-col text-center items-center p-6">
            <div className="flex items-center">
              <WorldSvg /> <div className="w-1" /> Public Match
            </div>
            <div className="h-2" />
            <Body style={{ fontSize: "12px" }}>Allow any wallet address to register for your match.</Body>
          </div>
        </div>

        <div className="w-8" />

        <div
          onClick={() => {
            if (!hasSeasonPass) return;
            setMatchType("private");
          }}
          className={twMerge(
            "flex flex-col items-center justify-around w-full h-[128px] rounded-md",
            "border border-[#DDDAD0] bg-white hover:border-[#1A6CBC] hover:bg-blue-300/30",
            !hasSeasonPass && "border-[#DDDAD0] bg-white cursor-not-allowed",
            (matchType === "private" || matchType === "season-pass") && "border-[#1A6CBC] bg-blue-300/30",
          )}
        >
          <div
            data-tooltip-id="match-type-tooltip"
            data-tooltip-content={`You must own the Season Pass to access this feature.`}
            className="flex flex-col text-center items-center p-6"
          >
            <div className="flex items-center">
              <SeasonPassIcon /> <div className="w-1" /> Private Match
            </div>
            <div className="h-2" />
            <Body style={{ fontSize: "12px" }}>Allow only specific wallet addresses to register for your match.</Body>
          </div>
        </div>
      </div>

      {matchType !== "public" && (
        <>
          <div className="h-6" />

          <RemainingPrivateMatches />

          <div className="h-3" />

          <Checkbox
            isChecked={matchType === "season-pass"}
            setIsChecked={(isChecked) => {
              if (isChecked) setMatchType("season-pass");
              else setMatchType("private");
            }}
            uncheckedLabel="Custom access list"
            checkedLabel="Season pass holders only"
          />
        </>
      )}

      {matchType === "private" && (
        <>
          <div className="h-6" />
          <div>
            <OverlineSmall className="text-ss-text-x-light">Allowed addresses</OverlineSmall>
            <Body className="text-ss-default">Add at least {numPlayers} wallet addresses to continue.</Body>

            <div className="h-4" />

            <div className="flex w-full space-x-4">
              <div className="relative w-full">
                <label htmlFor="search" className="absolute top-[12px] left-[12px]">
                  <SearchSvg />
                </label>

                <form
                  className="h-full"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addSearchInput();
                  }}
                >
                  <input
                    id="search"
                    type="text"
                    placeholder="Enter a wallet address"
                    value={searchInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchInput(value);

                      // Filter the data array based on the input value
                      if (value) {
                        const suggestions = allSearchOptions
                          .filter((item) => item.toLowerCase().includes(value.toLowerCase()))
                          .slice(0, 5);
                        setFilteredSuggestions(suggestions);
                      } else {
                        setFilteredSuggestions([]);
                      }
                    }}
                    className="p-2 pl-10 border border-gray-300 rounded w-full"
                  />
                </form>
                {filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-full rounded-md shadow-lg bg-white z-10">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          addAllowedAddress(nameToAddress[suggestion] ?? suggestion);
                          setSearchInput("");
                          setFilteredSuggestions([]);
                        }}
                        className="text-gray-900 p-2 hover:bg-gray-200 cursor-pointer"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button buttonType="primary" className="h-full" onClick={() => addSearchInput()}>
                Add
              </Button>
            </div>

            <div className="h-4" />

            <div className="flex flex-col space-y-2">
              {times(numPlayers, (index) => {
                return (
                  <div className="relative flex">
                    <input
                      className={twMerge("w-full bg-ss-bg-2 px-4 py-2 border border-[#DDDAD0]")}
                      type="text"
                      value={allowedAddresses[index] ?? ""}
                      readOnly={true}
                      disabled={true}
                    />

                    {allowedAddresses[index] && (
                      <button
                        className="absolute right-6 top-2 cursor-pointer"
                        onClick={() => {
                          setAllowedAddresses(allowedAddresses.filter((_, i) => i !== index));
                        }}
                      >
                        <CrossIcon />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <Tooltip
        style={{
          display: !hasSeasonPass ? "block" : "none",
        }}
        opacity={1}
        id="match-type-tooltip"
        variant="light"
      />
    </div>
  );
}
