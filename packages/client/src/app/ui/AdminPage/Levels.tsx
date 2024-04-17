import { useState } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { Entity, Has, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Button } from "../Theme/SkyStrife/Button";
import { Hex, hexToString } from "viem";
import { CreateLevel } from "./CreateLevel";
import { LevelDisplay } from "../../amalgema-ui/SummonIsland/LevelDisplay";

function StandardRotation({ levelId }: { levelId: Entity }) {
  const {
    components: { LevelInStandardRotation },
    externalWorldContract,
    externalWalletClient,
  } = useAmalgema();

  const value = useComponentValue(LevelInStandardRotation, levelId);

  const inRotation = value && value.value;

  return (
    <td>
      <Button
        buttonType="secondary"
        onClick={() => {
          if (!externalWorldContract) return;
          if (!externalWalletClient?.account) return;

          externalWorldContract.write.setRotationStandard([levelId as Hex, !inRotation], {
            account: externalWalletClient.account,
          });
        }}
        style={{ backgroundColor: inRotation ? "green" : "darkred", color: "white" }}
      >
        Standard Rotation: {inRotation ? "true" : "false"}
      </Button>
    </td>
  );
}

function SeasonPassRotation({ levelId }: { levelId: Entity }) {
  const {
    components: { LevelInSeasonPassRotation },
    externalWorldContract,
    externalWalletClient,
  } = useAmalgema();

  const value = useComponentValue(LevelInSeasonPassRotation, levelId);

  const inRotation = value && value.value;

  return (
    <td>
      <Button
        buttonType="secondary"
        onClick={() => {
          if (!externalWorldContract) return;
          if (!externalWalletClient?.account) return;

          externalWorldContract.write.setRotationSeasonPass([levelId as Hex, !inRotation], {
            account: externalWalletClient.account,
          });
        }}
        style={{ backgroundColor: inRotation ? "green" : "darkred", color: "white" }}
      >
        Season Pass Rotation: {inRotation ? "true" : "false"}
      </Button>
    </td>
  );
}

function OfficialLevel({ levelId }: { levelId: Entity }) {
  const {
    components: { OfficialLevel },
    externalWorldContract,
    externalWalletClient,
  } = useAmalgema();

  const value = useComponentValue(OfficialLevel, levelId);

  const inRotation = value && value.value;

  return (
    <td>
      <Button
        buttonType="secondary"
        onClick={() => {
          if (!externalWorldContract) return;
          if (!externalWalletClient?.account) return;

          externalWorldContract.write.setOfficial([levelId as Hex, !inRotation], {
            account: externalWalletClient.account,
          });
        }}
        style={{ backgroundColor: inRotation ? "green" : "darkred", color: "white" }}
      >
        Official Level: {inRotation ? "true" : "false"}
      </Button>
    </td>
  );
}

export function Levels() {
  const {
    components: {
      LevelTemplates,
      LevelInStandardRotation,
      LevelInSeasonPassRotation,
      OfficialLevel: OfficialLevelComponent,
    },
  } = useAmalgema();

  const [visible, setVisible] = useState(false);
  const levels = useEntityQuery([Has(LevelTemplates)])
    .map((levelId) => {
      const { value } = getComponentValueStrict(LevelTemplates, levelId);

      return { levelId, value };
    })
    .sort((a, b) => {
      const inStandardRotation = getComponentValue(LevelInStandardRotation, a.levelId)?.value;
      const inSeasonPassRotation = getComponentValue(LevelInSeasonPassRotation, a.levelId)?.value;
      const officialLevel = getComponentValue(OfficialLevelComponent, a.levelId)?.value;

      const inStandardRotationB = getComponentValue(LevelInStandardRotation, b.levelId)?.value;
      const inSeasonPassRotationB = getComponentValue(LevelInSeasonPassRotation, b.levelId)?.value;
      const officialLevelB = getComponentValue(OfficialLevelComponent, b.levelId)?.value;

      if (inStandardRotation && !inStandardRotationB) return -1;
      if (inSeasonPassRotation && !inSeasonPassRotationB) return -1;
      if (officialLevel && !officialLevelB) return -1;

      return 0;
    });

  return (
    <div>
      <div className="flex flex-row">
        <div className="w-full text-3xl text-left p-1">Levels</div>
        <Button buttonType="primary" onClick={() => setVisible(true)}>
          Create level
        </Button>
      </div>
      <table className="w-full text-lg text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xl text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th>ID</th>
            <th></th>
            <th>In standard rotation?</th>
            <th>In season pass rotation?</th>
            <th>Official Level?</th>
            <th>Preview</th>
          </tr>
        </thead>
        <tbody>
          {levels.map(({ levelId }) => (
            <tr key={levelId} className="border-4">
              <td>{hexToString(levelId as Hex)}</td>
              <td className="w-[360px]">
                <LevelDisplay levelId={levelId} />
              </td>
              <StandardRotation levelId={levelId} />
              <SeasonPassRotation levelId={levelId} />
              <OfficialLevel levelId={levelId} />
              <td>
                <div className="w-64 h-64">{/* <DisplayLevel level={levelId as Hex} /> */}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {visible && <CreateLevel close={() => setVisible(false)} />}
    </div>
  );
}
