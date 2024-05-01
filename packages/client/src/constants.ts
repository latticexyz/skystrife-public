import { stringToHex } from "viem";
import { resourceToHex } from "@latticexyz/common";

export enum Direction {
  Top,
  Right,
  Bottom,
  Left,
}

export const Directions = {
  [Direction.Top]: { x: 0, y: -1 },
  [Direction.Right]: { x: 1, y: 0 },
  [Direction.Bottom]: { x: 0, y: 1 },
  [Direction.Left]: { x: -1, y: 0 },
};
export const BYTES32_ZERO = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const SPAWN_SETTLEMENT = stringToHex("SpawnSettlement", { size: 32 });
export const EMOJI = "🔮";

export const LOCK_CLIENT = false;

export const SEASON_NAME = "Season 1";

export const UNLIMITED_DELEGATION = resourceToHex({ type: "system", namespace: "", name: "unlimited" });
export const SYSTEMBOUND_DELEGATION = resourceToHex({ type: "system", namespace: "", name: "systembound" });

export const WORLD_REGISTRATION_SYSTEM_ID = resourceToHex({ type: "system", namespace: "", name: "Registration" });
export const PLAYER_REGISTER_SYSTEM_ID = resourceToHex({ type: "system", namespace: "", name: "PlayerRegisterSystem" });
export const ALLOW_LIST_SYSTEM_ID = resourceToHex({ type: "system", namespace: "", name: "AllowListSystem" });
export const SEASON_PASS_ONLY_SYSTEM_ID = resourceToHex({
  type: "system",
  namespace: "MatchAccess",
  name: "SeasonPassOnly",
});
export const NAME_SYSTEM_ID = resourceToHex({ type: "system", namespace: "", name: "NameSystem" });
export const LOBBY_SYSTEM_ID = resourceToHex({ type: "system", namespace: "", name: "LobbySystem" });
export const MATCH_SYSTEM_ID = resourceToHex({ type: "system", namespace: "", name: "MatchSystem" });
export const LEVEL_UPLOAD_SYSTEM_ID = resourceToHex({ type: "system", namespace: "", name: "LevelUploadSystem" });
export const BUILD_SYSTEM_ID = resourceToHex({ type: "system", namespace: "", name: "BuildSystem" });
export const MOVE_SYSTEM_ID = resourceToHex({ type: "system", namespace: "", name: "MoveSystem" });
export const COPY_MAP_SYSTEM_ID = resourceToHex({ type: "system", namespace: "", name: "CopyMapSystem" });
