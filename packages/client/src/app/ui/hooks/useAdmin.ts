import { useMUD } from "../../../useMUD";
import { useComponentValue } from "@latticexyz/react";

export const useAdmin = () => {
  const {
    networkLayer: {
      components: { Admin },
      network: { playerEntity: playerAddress },
    },
  } = useMUD();

  const isAdmin = useComponentValue(Admin, playerAddress)?.value;

  return isAdmin;
};
