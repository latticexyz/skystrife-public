import { OptionsBar } from "./OptionsBar";
import { SessionWallet } from "./SessionWallet";

export function TopRight() {
  return (
    <div className="absolute right-0 top-0">
      <SessionWallet />
      <div className="h-4" />
      <OptionsBar />
    </div>
  );
}
