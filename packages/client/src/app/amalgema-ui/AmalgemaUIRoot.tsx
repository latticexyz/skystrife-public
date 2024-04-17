import { Header } from "./Header";
import { useStore } from "../../useStore";
import { InventorySidebar } from "./InventorySidebar";
import { Transactions } from "./Transactions";
import { ChooseUsernameModal } from "./ChooseUsernameModal";
import { ComponentBrowser } from "./Admin/ComponentBrowser";
import { DevTools } from "../../app/DevTools";
import { MatchCountdown } from "./SummonIsland/MatchCountdown";
import { Welcome } from "./SummonIsland/WelcomeBanner";
import { DateTime } from "luxon";
import { MatchTable } from "./MatchTable";
import GDPR from "./GDPR";

const RELEASE_TIME = DateTime.fromSeconds(1701086400).setZone("GMT");

export const AmalgemaUIRoot = () => {
  const layers = useStore((state) => {
    return {
      networkLayer: state.networkLayer,
    };
  });

  if (!layers.networkLayer) return <></>;

  const now = DateTime.now().setZone("GMT");
  if (now < RELEASE_TIME) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center">
        <div
          style={{
            background:
              "linear-gradient(152deg, rgba(244, 243, 241, 0.98) 0%, rgba(244, 243, 241, 0.88) 100%), url(/assets/ship-background.jpeg), lightgray -381.491px 0.145px / 126.42% 100% no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "right",
            zIndex: -2,
          }}
          className="fixed top-0 left-0 h-screen w-screen bg-cover"
        />
        <div className="text-4xl font-bold">Sky Strife will be available at 12pm GMT.</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <DevTools />

      <div className="h-screen flex flex-col grow">
        <Header />

        <div
          style={{
            background:
              "linear-gradient(152deg, rgba(244, 243, 241, 0.98) 0%, rgba(244, 243, 241, 0.88) 100%), url(/assets/ship-background.jpeg), lightgray -381.491px 0.145px / 126.42% 100% no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "right",
            zIndex: -2,
          }}
          className="fixed top-0 left-0 h-screen w-screen bg-cover"
        />

        <div className="grow px-8 py-6 flex flex-col">
          <Welcome />

          <MatchCountdown />

          <div className="h-6" />

          <MatchTable />
        </div>
      </div>

      <InventorySidebar />

      <Transactions />
      <ChooseUsernameModal />

      <ComponentBrowser />

      <GDPR />
    </div>
  );
};
