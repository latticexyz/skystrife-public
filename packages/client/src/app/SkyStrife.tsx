import { useStore } from "../useStore";
import { HeadlessLayer } from "./HeadlessLayer";
import { UIRoot } from "./ui/UIRoot";
import { LoadingScreen } from "./amalgema-ui/LoadingScreen";

export const SkyStrife = () => {
  const networkLayer = useStore((state) => state.networkLayer);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <LoadingScreen networkLayer={networkLayer} usePrepTime={true} />

      <UIRoot />

      <HeadlessLayer networkLayer={networkLayer} />
    </div>
  );
};
