import { PluginManager } from "../PluginManager";
import { FullscreenButton } from "./FullscreenButton";
import { SettingsButton } from "./SettingsButton";
import { TutorialButton } from "./TutorialButton";

export function OptionsBar() {
  return (
    <div className="float-right flex gap-x-4">
      <PluginManager />
      <SettingsButton />
      <FullscreenButton />
      <TutorialButton />
    </div>
  );
}
