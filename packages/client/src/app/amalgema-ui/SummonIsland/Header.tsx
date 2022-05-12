import { CrossIcon } from "../../ui/Theme/CrossIcon";
import { OverlineLarge } from "../../ui/Theme/SkyStrife/Typography";

export function Header({ closeModal }: { closeModal: () => void }) {
  return (
    <div
      className="absolute top-0 left-0 flex flex-row justify-between items-center bg-white w-full pt-8 p-6 pb-4 border-b border-ss-stroke z-50"
      style={{}}
    >
      <OverlineLarge>Create match</OverlineLarge>

      <div className="w-10" />

      <button onClick={() => closeModal()}>
        <CrossIcon />
      </button>
    </div>
  );
}
