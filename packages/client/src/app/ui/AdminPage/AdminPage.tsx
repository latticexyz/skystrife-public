import { useState } from "react";
import { Button } from "../Theme/SkyStrife/Button";
import { Levels } from "./Levels";
import { Players } from "./Players";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Templates } from "./Templates";
import { Delegations } from "./Delegations";
import { Matches } from "./Matches";
import { SeasonPass } from "./SeasonPass";
import { SessionWalletManager } from "../../amalgema-ui/SessionWalletManager";

export const AdminPage = () => {
  const [page, setPage] = useState("Matches");

  let pageComponent = null;
  if (page === "Matches") pageComponent = <Matches />;
  if (page === "Templates") pageComponent = <Templates />;
  if (page === "Levels") pageComponent = <Levels />;
  if (page === "Players") pageComponent = <Players />;
  if (page === "Delegations") pageComponent = <Delegations />;
  if (page === "Season Pass") pageComponent = <SeasonPass />;

  return (
    <div>
      <div className="flex gap-x-2 p-4">
        <ConnectButton />
        <SessionWalletManager />
      </div>
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
