import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Contract } from "@canvas-js/core";
import { SIWESigner } from "@canvas-js/chain-ethereum";
import { useLiveQuery, useCanvas } from "@canvas-js/hooks";
import { encryptSafely, decryptSafely, getEncryptionPublicKey, EthEncryptedData } from "@metamask/eth-sig-util"
import { useMUD } from "../../../useMUD";
import { useCurrentPlayer } from "../hooks/useCurrentPlayer";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { Wallet } from "ethers";
import { useCurrentTime } from "../../amalgema-ui/hooks/useCurrentTime";
import { DateTime } from "luxon";
import { useExternalAccount } from "../hooks/useExternalAccount";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { BYTES32_ZERO } from "../../../constants";
import { getBurnerWallet } from "../../../mud/getBrowserNetworkConfig";
import { ClickWrapper } from "../Theme/ClickWrapper";

type Message = { id: string; address: string; content: string; color: string; name: string; timestamp: number };
type Chatter = { id: string; address: string; key: string; };

enum CHANNELS {
  ALL = 'All',
  PLAYER = 'Player'
}

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
        channel: "string",
        $indexes: ["user", "timestamp"],
      },
      chatters: {
        id: "primary",
        address: "string",
        key: "string"
      },
    },

    actions: {
      async createMessage(db, { content, name, color, channel }, { id, address, timestamp }) {
        await db.set("message", { id, address, content, name, color, timestamp, channel });
      },

      async createChatter(db, { key }, { id, address }) {
        console.log('creating chatter, key: ', key, ' address: ', address);
        await db.set("chatters", { id, address, key });
      }
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
  const currentPlayer = useCurrentPlayer(matchEntity ?? ("" as Entity));

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

  const chatters = useLiveQuery<Chatter>(app, "chatters", {
    orderBy: { address: "asc" },
  });

  const [ initialized, setInitialized ] = useState<boolean>(false);
  // TODO: Make enum, Channels.ALL, Channels.PLAYER
  const [ channel, setChannel ] = useState<string>(CHANNELS.ALL);

  useEffect(() => {
    if (!app || initialized || chatters === null) return

    // console.log('initialized :>> ', initialized);

    const sessionWalletPrivateKey = getBurnerWallet(); 
    const encryptionKey = getEncryptionPublicKey(sessionWalletPrivateKey.slice(2))

    // console.log('chatters :>> ', chatters);

    const matchingChatters = chatters.filter((chatter: Chatter) => {
      return (chatter.key === encryptionKey)
    });

    // console.log('matchingChatters :>> ', matchingChatters);

    if (matchingChatters.length > 0) {
      console.log('a key was matched');
      return
    } else {
      console.log('~~~ a key was not matched. creating one now. ~~~')
      registerEncryptionKey();
    }

    setInitialized(true);
  }, [app, chatters, initialized]);

  const registerEncryptionKey = useCallback(async () => {
    const sessionWalletPrivateKey = getBurnerWallet(); 
    const encryptionKey = getEncryptionPublicKey(sessionWalletPrivateKey.slice(2))

    app.actions.createChatter({ key: encryptionKey});
  }, [app]);

  const now = useCurrentTime();
  const secondsVisibleAfterInteraction = 15;
  const [lastInteraction, setLastInteraction] = useState(DateTime.now());
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

  const [newMessage, setNewMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollIntoViewRef = useRef<HTMLDivElement>(null);

  const messages = useLiveQuery<Message>(app, "message", {
    orderBy: { timestamp: "asc" },
  });

  useEffect(() => {
    setLastInteraction(DateTime.now());
    scrollIntoViewRef.current?.scrollIntoView();
  }, [messages]);

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
    const name = getComponentValue(Name, mainWalletAddressEntity)?.value ?? "Spectator";

    try {
      setNewMessage("");
      blurInput();

      await app.actions.createMessage({
        content: newMessage,
        name,
        channel: CHANNELS.ALL,
        color: currentPlayer.playerColor.color.toString(16),
      });
      sendAnalyticsEvent("sent-message", { matchEntity });
    } catch (err) {
      console.error(err);
    }
  }, [
    Name,
    app,
    blurInput,
    currentPlayer.playerColor.color,
    externalWalletClient.address,
    matchEntity,
    newMessage,
    sendAnalyticsEvent,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === inputRef.current) return;

      if (e.key === "Enter" && e.shiftKey) {
        console.log('shift + enter opened thing');
        setChannel(CHANNELS.PLAYER);
        focusInput();
        e.preventDefault();
      } else if (e.key === "Enter") {
        console.log('enter opened thing');
        setChannel(CHANNELS.ALL);
        focusInput();
        e.preventDefault();
      } else if (e.key === "Escape") {
        blurInput();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [blurInput, focusInput]);

  const placeholderPadValue = 
    channel === CHANNELS.ALL ? "46px" :
    channel === CHANNELS.PLAYER ? "72px" : 
    "0px";

  return (
    <div
      style={{
        // opacity: lastInteraction.plus({ seconds: secondsVisibleAfterInteraction }).diff(now).milliseconds > 0 ? 1 : 0,
        opacity: 1
      }}
      onMouseMove={() => {
        setLastInteraction(DateTime.now());
      }}
      className="absolute bottom-12 pb-[37px] left-0 h-[300px] w-[300px] rounded border border-ss-stroke bg-black/25 transition-all duration-300"
    >
      <div className="channel-tabs">
        {[CHANNELS.ALL, CHANNELS.PLAYER].map((channelOption) => (
          <ClickWrapper>
            <button
              key={channelOption}
              className={`channel-tab ${channel === channelOption ? 'active' : ''}`}
              onClick={() => setChannel(channel)}
            >
              {channelOption}
            </button>
          </ClickWrapper>
        ))}
      </div>
      <div className="h-full w-full">
        <div className="w-full overflow-y-auto">
          <ul
            style={{
              overflowAnchor: "none",
            }}
            className="h-full w-full px-2 space-y-1 flex flex-col"
          >
            <div className="grow" />

            {(messages ?? []).map((message) => (
              <li
                style={{
                  textShadow: "0 0 2px black",
                  overflowWrap: "anywhere",
                }}
                key={message.id}
                className="flex text-white items-baseline flex-wrap space-x-1 w-full"
              >
                <span
                  style={{
                    color: message.color,
                  }}
                  className="font-bold"
                >
                  {message.name}:
                </span>
                <span>{message.content}</span>
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
            [{channel}]
          </div>
          <input
            onFocus={() => {
              setLastInteraction(DateTime.now());
              setInputFocused(true);
            }}
            ref={inputRef}
            type="text"
            className={`w-full outline-none px-2 pl-[${placeholderPadValue}] text-white py-1 bg-black/70 opacity-0 focus:opacity-100 border border-ss-stroke rounded`}
            value={newMessage}
            placeholder="Type a message"
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!app || app.status !== "connected"}
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
