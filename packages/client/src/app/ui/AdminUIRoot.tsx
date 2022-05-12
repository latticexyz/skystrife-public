import { useStore } from "../../useStore";
import { AdminPage } from "./AdminPage";

export const AdminUIRoot = () => {
  const layers = useStore((state) => {
    return {
      networkLayer: state.networkLayer,
    };
  });

  if (!layers.networkLayer) return <></>;

  return (
    <div>
      <AdminPage />
    </div>
  );
};
