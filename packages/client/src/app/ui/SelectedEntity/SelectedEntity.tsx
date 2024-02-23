import { useEntityQuery } from "@latticexyz/react";
import { Has } from "@latticexyz/recs";
import { useMUD } from "../../../useMUD";
import { EntityInfo } from "./EntityInfo";

export function SelectedEntity() {
  const {
    localLayer: {
      components: { Selected },
    },
  } = useMUD();

  const selectedEntity = useEntityQuery([Has(Selected)])[0];

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-1">
      {selectedEntity && <EntityInfo entity={selectedEntity} />}
    </div>
  );
}
