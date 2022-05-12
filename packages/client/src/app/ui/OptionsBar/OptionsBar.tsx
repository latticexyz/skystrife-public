import { FullscreenButton } from "./FullscreenButton";
import { SettingsButton } from "./SettingsButton";
import { TutorialButton } from "./TutorialButton";

export function OptionsBar() {
  return (
    <div className="float-right flex">
      <SettingsButton />
      <div className="w-4" />
      <FullscreenButton />
      <div className="w-4" />
      <TutorialButton />
    </div>
  );
}
