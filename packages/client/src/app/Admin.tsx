import { useStore } from "../useStore";
import { LoadingScreen } from "./amalgema-ui/LoadingScreen";
import { AdminUIRoot } from "./ui/AdminUIRoot";

export const Admin = () => {
  const networkLayer = useStore((state) => state.networkLayer);

  return (
    <>
      <LoadingScreen networkLayer={networkLayer} />
      <AdminUIRoot />
    </>
  );
};
