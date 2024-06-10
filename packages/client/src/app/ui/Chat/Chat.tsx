import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Contract } from "@canvas-js/core";
import { SIWESigner } from "@canvas-js/chain-ethereum";
import { useLiveQuery, useCanvas } from "@canvas-js/hooks";
import { useMUD } from "../../../useMUD";
import { useCurrentPlayer } from "../hooks/useCurrentPlayer";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { Wallet } from "ethers";
import { useCurrentTime } from "../../amalgema-ui/hooks/useCurrentTime";
import { DateTime } from "luxon";
import { useExternalAccount } from "../hooks/useExternalAccount";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { BYTES32_ZERO } from "../../../constants";
import useOnClickOutside from "../hooks/useOnClickOutside";

type Message = { id: string; address: string; content: string; color: string; name: string; timestamp: number };

const createContract = (matchEntity: Entity) => {
  const contract = {
    topic: `${matchEntity}.canvas.xyz`,
    models: {
      message: {
        id: "primary",
        address: "string",
        name: "string",
        color: "string",
        content: "string",
        timestamp: "integer",
        $indexes: ["user", "timestamp"],
      },
    },

    actions: {
      async createMessage(db, { content, name, color }, { id, address, timestamp }) {
        await db.set("message", { id, address, content, name, color, timestamp });
      },
    },
  } as Contract;

  return contract;
};

export function Chat() {
  const {
    networkLayer: {
      components: { Name },
      network: { matchEntity },
      utils: { sendAnalyticsEvent },
    },
    phaserLayer: {
      api: {
        mapInteraction: { disableMapInteraction, enableMapInteraction },
      },
    },
  } = useMUD();

  const externalWalletClient = useExternalAccount();

  const randomWallet = useMemo(() => Wallet.createRandom(), []);
  const contract = useMemo(() => createContract(matchEntity ?? ("" as Entity)), [matchEntity]);
  const { app } = useCanvas({
    contract,
    indexHistory: false,
    discoveryTopic: "canvas-discovery",
    signers: [new SIWESigner({ signer: randomWallet })],
    bootstrapList: [
      "/dns4/canvas-chat-discovery-p0.fly.dev/tcp/443/wss/p2p/12D3KooWG1zzEepzv5ib5Rz16Z4PXVfNRffXBGwf7wM8xoNAbJW7",
      "/dns4/canvas-chat-discovery-p1.fly.dev/tcp/443/wss/p2p/12D3KooWNfH4Z4ayppVFyTKv8BBYLLvkR1nfWkjcSTqYdS4gTueq",
      "/dns4/canvas-chat-discovery-p2.fly.dev/tcp/443/wss/p2p/12D3KooWRBdFp5T1fgjWdPSCf9cDqcCASMBgcLqjzzBvptjAfAxN",
      "/dns4/peer.canvasjs.org/tcp/443/wss/p2p/12D3KooWFYvDDRpXtheKXgQyPf7sfK2DxS1vkripKQUS2aQz5529",
    ],
  });

  const now = useCurrentTime();
  const secondsVisibleAfterInteraction = 15;
  const [lastInteraction, setLastInteraction] = useState(DateTime.fromSeconds(0));
  const [inputFocused, setInputFocused] = useState(false);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
    disableMapInteraction("chat");
    setInputFocused(true);
    setLastInteraction(DateTime.now());
  }, [disableMapInteraction]);

  const blurInput = useCallback(() => {
    if (!inputFocused) return;

    inputRef.current?.blur();
    enableMapInteraction("chat");
    setInputFocused(false);
    setLastInteraction(DateTime.now());
  }, [enableMapInteraction, inputFocused]);

  const currentPlayer = useCurrentPlayer(matchEntity ?? ("" as Entity));

  const [newMessage, setNewMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useOnClickOutside(inputRef, blurInput);
  const scrollIntoViewRef = useRef<HTMLDivElement>(null);

  const messages = useLiveQuery<Message>(app, "message", {
    orderBy: { timestamp: "asc" },
  });

  useEffect(() => {
    if (app?.status !== "connected") return;

    setLastInteraction(DateTime.now());
    scrollIntoViewRef.current?.scrollIntoView();
  }, [app?.status, messages]);

  useEffect(() => {
    if (lastInteraction.plus({ seconds: secondsVisibleAfterInteraction }).diff(now).milliseconds > 0) return;
    scrollIntoViewRef.current?.scrollIntoView();
  }, [blurInput, lastInteraction, now]);

  const sendMessage = useCallback(async () => {
    if (!app) return;
    if (newMessage.length === 0) {
      blurInput();
      return;
    }

    const mainWalletAddressEntity = externalWalletClient.address
      ? addressToEntityID(externalWalletClient.address)
      : (BYTES32_ZERO as Entity);
    const name =
      getComponentValue(Name, mainWalletAddressEntity)?.value ??
      externalWalletClient.address?.slice(0, 8) ??
      "Spectator";

    try {
      setNewMessage("");
      blurInput();

      await app.actions.createMessage({
        content: newMessage,
        name,
        color: currentPlayer?.playerColor.color.toString(16),
      });
      sendAnalyticsEvent("sent-message", { matchEntity });
    } catch (err) {
      console.error(err);
    }
  }, [Name, app, blurInput, currentPlayer, externalWalletClient.address, matchEntity, newMessage, sendAnalyticsEvent]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === inputRef.current) return;
      if (e.key === "Enter") {
        focusInput();
        e.preventDefault();
      }
      if (e.key === "Escape") blurInput();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [app?.status, blurInput, focusInput]);

  const allMessages = messages ?? [];
  useEffect(() => {
    if (app?.status === "connected" && allMessages.length === 0) {
      allMessages.unshift({
        id: "0",
        color: "white",
        name: "System",
        content: "Welcome to Sky Strife! Press enter to chat.",
        address: "0x0",
        timestamp: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app, app?.status]);

  return (
    <div
      style={{
        opacity: lastInteraction.plus({ seconds: secondsVisibleAfterInteraction }).diff(now).milliseconds > 0 ? 1 : 0,
      }}
      onMouseMove={() => {
        setLastInteraction(DateTime.now());
      }}
      className="absolute bottom-12 left-0 h-[160px] w-[300px] rounded border border-ss-stroke bg-black/25 transition-all duration-300"
    >
      <div className="h-full w-full">
        <div className="w-full overflow-hidden">
          <ul
            style={{
              overflowAnchor: "none",
            }}
            className="h-full w-full px-2 space-y-1 flex flex-col"
          >
            <div className="grow" />

            {allMessages.map((message) => (
              <li
                style={{
                  textShadow: "0 0 2px black",
                  overflowWrap: "anywhere",
                }}
                key={message.id}
                className="text-white w-full whitespace-normal break-words"
              >
                <span
                  style={{
                    color: message.color,
                  }}
                  className="font-bold"
                >
                  {message.name}:
                </span>{" "}
                {message.content}
              </li>
            ))}
            <div ref={scrollIntoViewRef} />
          </ul>
        </div>

        <div className="h-2" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          onKeyDown={(e) => {
            if (inputRef.current !== document.activeElement) return;
            if (e.key === "Escape") blurInput();

            setLastInteraction(DateTime.now());
          }}
          className="relative"
        >
          <div
            style={{
              display: inputFocused ? "block" : "none",
            }}
            className="absolute left-2 top-[5px] text-white"
          >
            [All]
          </div>
          <input
            onFocus={() => {
              setLastInteraction(DateTime.now());
              setInputFocused(true);
            }}
            ref={inputRef}
            type="text"
            className="w-full outline-none px-2 pl-[46px] text-white py-1 bg-black/70 opacity-0 focus:opacity-100 border border-ss-stroke rounded"
            value={newMessage}
            placeholder={app?.status === "connected" ? "Press enter to chat" : "Connecting..."}
            onChange={(e) => {
              if (app?.status !== "connected") return;

              setNewMessage(e.target.value);
            }}
            disabled={!app}
          />
          {inputFocused &&
            (app?.status === "connected" ? (
              <div className="absolute top-[9px] right-2 w-4 h-4 rounded-full bg-green-500" />
            ) : (
              <div className="absolute top-[9px] right-2 w-4 h-4 rounded-full animate-pulse bg-red-500" />
            ))}
        </form>
      </div>
    </div>
  );
}
