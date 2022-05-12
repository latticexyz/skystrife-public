import { Caption, Link } from "../ui/Theme/SkyStrife/Typography";
import { useAmalgema } from "../../useAmalgema";
import { Entity } from "@latticexyz/recs";
import { toEthAddress } from "@latticexyz/utils";
import { Hex } from "viem";
import { useComponentValue } from "@latticexyz/react";
import { formatAddress } from "./CurrentProfile";

const MAX_NAME_DISPLAY = 20;

export const DisplayNameUnformatted = ({ entity }: { entity: Entity }) => {
  const {
    components: { Name },
  } = useAmalgema();

  const name = useComponentValue(Name, entity);
  const text = name ? name.value.substring(0, MAX_NAME_DISPLAY) : formatAddress(toEthAddress(entity) as Hex);

  return <span>{text}</span>;
};

export const DisplayName = ({ entity }: { entity: Entity }) => {
  return (
    <span className="text-ss-text-link">
      <DisplayNameUnformatted entity={entity} />
    </span>
  );
};

export const DisplayNameWithLink = ({ entity }: { entity: Entity }) => {
  const {
    network: { publicClient },
  } = useAmalgema();

  const explorerUrl = publicClient.chain.blockExplorers?.default.url;

  return (
    <span>
      {explorerUrl ? (
        <Link href={`${explorerUrl}/address/${toEthAddress(entity)}`}>
          <DisplayName entity={entity} />
        </Link>
      ) : (
        <DisplayName entity={entity} />
      )}
    </span>
  );
};

export const CreatedBy = ({ createdBy }: { createdBy: Hex }) => {
  return (
    <Caption>
      created by <DisplayNameWithLink entity={createdBy as Entity} />
    </Caption>
  );
};
