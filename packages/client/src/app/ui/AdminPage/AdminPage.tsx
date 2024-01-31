import { useEffect, useState } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { Button } from "../Theme/SkyStrife/Button";
import { Levels } from "./Levels";
import { Players } from "./Players";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Templates } from "./Templates";
import { Delegations } from "./Delegations";
import { Matches } from "./Matches";
import { SeasonPass } from "./SeasonPass";

export const AdminPage = () => {
  const {
    network: { initialiseWallet },
  } = useAmalgema();

  const [page, setPage] = useState("Matches");

  const externalAccount = useAccount();
  const { address } = externalAccount;

  useEffect(() => {
    if (!address) return;

    initialiseWallet(address);
  }, [address, initialiseWallet]);

  let pageComponent = null;
  if (page === "Matches") pageComponent = <Matches />;
  if (page === "Templates") pageComponent = <Templates />;
  if (page === "Levels") pageComponent = <Levels />;
  if (page === "Players") pageComponent = <Players />;
  if (page === "Delegations") pageComponent = <Delegations />;
  if (page === "Season Pass") pageComponent = <SeasonPass />;

  return (
    <div>
      <ConnectButton />
      <div>
        {["Matches", "Templates", "Levels", "Players", "Delegations", "Season Pass"].map((p) => (
          <Button buttonType="tertiary" key={p} onClick={() => setPage(p)}>
            {p}
          </Button>
        ))}
      </div>
      {pageComponent}
    </div>
  );
};
