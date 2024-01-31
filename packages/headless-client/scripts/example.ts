import { Has, defineEnterSystem, getComponentValueStrict } from "@latticexyz/recs";

import { createSkyStrife } from "../src/createSkyStrife";

const skyStrife = await createSkyStrife();

const {
  networkLayer: {
    world,
    components: { MatchName },
  },
} = skyStrife;

defineEnterSystem(world, [Has(MatchName)], ({ entity }) => {
  const matchName = getComponentValueStrict(MatchName, entity);

  console.log(`Match ${matchName.value} was created.`);
});
