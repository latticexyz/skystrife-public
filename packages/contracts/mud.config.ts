import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  deploy: {
    upgradeableWorldImplementation: true,
  },
  codegen: {
    outputDirectory: "codegen",
  },
  userTypes: {
    EncodedLengths: { filePath: "@latticexyz/store/src/EncodedLengths.sol", type: "bytes32" },
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", type: "bytes32" },
  },
  enums: {
    UnitTypes: [
      "Unknown", // 0
      "Swordsman", // 1
      "Pikeman", // 2
      "Halberdier", // 3
      "Pillager", // 4
      "Knight", // 5
      "Dragoon", // 6
      "Archer", // 7
      "Catapult", // 8
      "Marksman", // 9
      "Brute", // 10
    ],
    CombatArchetypes: [
      "Unknown", // 0
      "Swordsman", // 1
      "Pikeman", // 2
      "Halberdier", // 3
      "Pillager", // 4
      "Knight", // 5
      "Dragoon", // 6
      "Archer", // 7
      "Catapult", // 8
      "Marksman", // 9
      "Settlement", // 10
      "SpawnSettlement", // 11
      "GoldMine", // 12
      "Brute", // 13
    ],
    TerrainTypes: ["Unknown", "Grass", "Mountain", "Forest"],
    StructureTypes: ["Unknown", "Settlement", "SpawnSettlement", "WoodenWall", "GoldMine", "GoldCache"],
  },
  excludeSystems: ["SeasonPassOnlySystem"],
  tables: {
    // temporarily used in the client for backwards compat while we update frontend
    // this marks entities (eg. units, structures) as being part of the `matchEntity` match
    // TODO: remove
    Match: {
      type: "offchainTable",
      key: ["matchEntityKey", "entity"],
      schema: {
        matchEntityKey: "bytes32", // same as matchEntity below, but renamed to avoid arg name conflicts in tablegen
        entity: "bytes32",
        matchEntity: "bytes32", // leave this as matchEntity because frontend queries based on this value
      },
    },
    /**
     * Used on terrain to modify the armor of entities standing on it.
     */
    ArmorModifier: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "int32",
      },
    },
    /**
     * Marks an entity as capturable.
     * Instead of dying, they will return to full health
     * and change ownership to the capturer.
     */
    Capturable: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "bool",
      },
    },
    /**
     * The time at which charging started. This is used to determine
     * how much gold to recharge when refreshing the charged unit in the
     * future.
     * Charger => StartTime
     */
    ChargedByStart: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "uint256",
      },
    },
    /**
     * References the entity that is being charged.
     * Charger => Chargee
     */
    Chargee: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "bytes32",
      },
    },
    Chargers: {
      key: ["matchEntity", "chargee"],
      schema: {
        matchEntity: "bytes32",
        chargee: "bytes32",
        chargers: "bytes32[]",
      },
    },
    /**
     * Sets an entity as a charger. The value here is
     * added to the total amount of gold recharged
     * when the target entity is refreshed.
     */
    Charger: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "int32",
      },
    },
    /**
     * Used to track the total amount of gold recharged by a Charger.
     * Used to implement depletable Gold Mines.
     */
    ChargeCap: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        cap: "int32",
        totalCharged: "int32",
      },
    },
    /**
     * If an entity has this it is able to engage in combat.
     * All values represented in thousands.
     * i.e. 100_000 HP = 100 HP
     */
    Combat: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        health: "int32",
        maxHealth: "int32",
        strength: "int32",
        counterStrength: "int32",
        minRange: "int32",
        maxRange: "int32",
        archetype: "CombatArchetypes",
      },
    },
    /**
     * Set a value for a specific Archetype combat matchup.
     * The value is a percentage bonus or penalty.
     * i,e. 30 = 30% bonus, -30 = 30% penalty
     */
    ArchetypeModifier: {
      key: ["attacker", "defender"],
      schema: {
        attacker: "CombatArchetypes",
        defender: "CombatArchetypes",
        // expressed as a percentage
        mod: "int32",
        // We store the keys here to aid in offchain lookups
        // this all fits in one storage slot so it's not a big deal
        attackerArchetype: "CombatArchetypes",
        defenderArchetype: "CombatArchetypes",
      },
    },
    /**
     * The amount of Gold a Player receives when killing a unit.
     */
    GoldOnKill: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "int32",
      },
    },
    /**
     * Emitted during combat to inform client animations.
     */
    CombatOutcome: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        attacker: "bytes32",
        defender: "bytes32",
        attackerDamageReceived: "int32",
        defenderDamageReceived: "int32",
        attackerDamage: "int32",
        defenderDamage: "int32",
        ranged: "bool",
        attackerDied: "bool",
        defenderDied: "bool",
        defenderCaptured: "bool",
        blockNumber: "uint256",
        timestamp: "uint256",
      },
    },
    /**
     * Marks an entity as able to construct other entities.
     */
    Factory: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        prototypeIds: "bytes32[]",
        goldCosts: "int32[]",
      },
    },
    /**
     * Used in conjuction with Gold to lazily calculate Gold regen.
     * Also used to determine the last time an entity took an action
     * in order to calculate their cooldown.
     */
    LastAction: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "uint256",
      },
    },
    /**
     * Used in map creation to mark the center of the map.
     */
    MapCenter: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "bool",
      },
    },
    /**
     * Marks an entity as able to move.
     * The value is how many units there are able to move.
     * Represented in thousands.
     * i.e. 1000 = 1 unit.
     */
    Movable: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "int32",
      },
    },
    /**
     * Given to terrain to determine how much it costs to move onto it.
     * Used in conjunction with Movable during path calculation.
     */
    MoveDifficulty: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "int32",
      },
    },
    /**
     * Stores a reference to the address that created a Player entity.
     */
    CreatedByAddress: {
      key: ["matchEntity", "playerEntity"],
      schema: {
        matchEntity: "bytes32",
        playerEntity: "bytes32",
        value: "bytes32",
      },
    },
    /**
     * Used to determine the owner of an entity created in a match.
     * i.e. Player -> Unit
     */
    OwnedBy: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "bytes32",
      },
    },
    /**
     * Marks a player address as a player.
     * Value is an incrementing integer.
     */
    Player: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "uint32",
      },
    },
    /**
     * Used in the lobby system to determine if a player is ready.
     */
    PlayerReady: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "uint256",
      },
    },
    /**
     * The position of an entity.
     */
    Position: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        x: "int32",
        y: "int32",
      },
    },
    EntitiesAtPosition: {
      key: ["matchEntity", "x", "y"],
      schema: {
        matchEntity: "bytes32",
        x: "int32",
        y: "int32",
        entities: "bytes32[]",
      },
    },
    /**
     * Marks a unit as unable to Move and Attack in the same turn.
     */
    RequiresSetup: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "bool",
      },
    },
    /**
     * Set during Player registration to reserve a specific SpawnPoint in a level for a player entity.
     */
    SpawnReservedBy: {
      key: ["matchEntity", "index"],
      schema: {
        matchEntity: "bytes32",
        index: "uint256",
        value: "bytes32",
      },
    },
    /**
     * Marks an entity as a Spawn Point.
     * Players can use it to enter a match.
     */
    SpawnPoint: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "bool",
      },
    },
    /**
     * Used by players to construct units from Factories.
     */
    Gold: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        current: "int32",
      },
    },
    /**
     * Used to mark something as an Structure.
     * NOTE: Only use this to determine if something is an Structure contract-side.
     * Specific Structure Types are only used client-side to deteremine rendering.
     */
    StructureType: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "StructureTypes",
      },
    },
    /**
     * Used to mark something as Terrain.
     * NOTE: Only use this to determine if something is Terrain contract-side.
     * Specific Terrain Types are only used client-side to deteremine rendering.
     */
    TerrainType: {
      type: "offchainTable",
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "TerrainTypes",
      },
    },
    /**
     * Used to mark something as a Unit.
     * NOTE: Only use this to determine if something is a Unit contract-side.
     * Specific Unit Types are only used client-side to deteremine rendering.
     */
    UnitType: {
      type: "offchainTable",
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "UnitTypes",
      },
    },
    /**
     * Whethere this entity blocks the movement of other entities.
     */
    Untraversable: {
      key: ["matchEntity", "entity"],
      schema: {
        matchEntity: "bytes32",
        entity: "bytes32",
        value: "bool",
      },
    },
    /**
     * Index for finding a player in a given Match.
     */
    MatchPlayer: {
      key: ["matchEntity", "playerAddress"],
      schema: {
        matchEntity: "bytes32",
        playerAddress: "address",
        playerEntity: "bytes32",
      },
    },

    // ______________________ SKYPOOL ____________________________

    /**
     * Stores players chosen names.
     */
    Name: "string",
    /**
     * Used to check if a name is already taken.
     */
    NameExists: {
      key: ["nameData"],
      schema: {
        nameData: "bytes32",
        value: "bool",
      },
    },

    /**
     * Marks an entity as an admin. Used on address entities.
     */
    Admin: "bool",

    /**
     * Marks a template as a Hero in the standard rotation.
     */
    HeroInRotation: "bool",
    /**
     * Marks a template as a Hero in the season pass only rotation.
     */
    HeroInSeasonPassRotation: "bool",

    /**
     * SkyPool settings:
     * - Creation cost of SkyPool matches.
     * - Window (in seconds) to determine match rewards.
     * - Token that is used in SkyPool rewards.
     */
    SkyPoolConfig: {
      key: [],
      schema: {
        locked: "bool",
        cost: "uint256",
        window: "uint256",
        orbToken: "address",
        seasonPassToken: "address",
        skyKeyToken: "address",
      },
    },
    /**
     * SkyPool match rewards broken down by
     * the number of players in a match.
     */
    MatchRewardPercentages: {
      key: ["numPlayers"],
      schema: {
        numPlayers: "uint256",
        percentages: "uint256[]",
      },
    },

    /**
     * Used to differentiate between dev-made and community-made levels.
     */
    OfficialLevel: {
      type: "offchainTable",
      key: ["levelId"],
      schema: {
        levelId: "bytes32",
        value: "bool",
      },
    },

    /**
     * Level can be used to create a match.
     */
    LevelInStandardRotation: {
      key: ["levelId"],
      schema: {
        levelId: "bytes32",
        value: "bool",
      },
    },

    /**
     * Only Season Pass holders can create a match with this level.
     */
    LevelInSeasonPassRotation: {
      key: ["levelId"],
      schema: {
        levelId: "bytes32",
        value: "bool",
      },
    },

    LastMatchIndex: {
      key: [],
      schema: {
        matchIndex: "uint32",
      },
    },
    /**
     * Map match entities to their match index (derived from auto-incrementing LastMatchIndex), used in pool rewards
     */
    MatchIndex: {
      key: ["matchEntity"],
      schema: {
        matchEntity: "bytes32",
        matchIndex: "uint32",
      },
    },
    /**
     * Map match indices to their match entity.
     * Used when calculating rewards for a match to look up matches
     * by their index only.
     */
    MatchIndexToEntity: {
      key: ["matchIndex"],
      schema: {
        matchIndex: "uint32",
        matchEntity: "bytes32",
      },
    },

    /**
     * The incrementing token ID of season passes
     */
    SeasonPassIndex: {
      key: [],
      schema: {
        tokenIndex: "uint256",
      },
    },
    /**
     * - Initial price of season pass
     * - price decreases by this per second
     * - price is multiplied by this on each purchase
     */
    SeasonPassConfig: {
      key: [],
      schema: {
        minPrice: "uint256",
        startingPrice: "uint256",
        rate: "uint256",
        multiplier: "uint256",
        mintCutoff: "uint256",
      },
    },

    /**
     * Store timing information for a season.
     * This is separate from SeasonPassConfig because adding columns
     * to an existing World is not well-supported in MUD yet.
     */
    SeasonTimes: {
      key: [],
      schema: {
        seasonStart: "uint256",
        seasonEnd: "uint256",
      },
    },

    /**
     * Timestamp for the last sale of a season pass.
     * Used to calculate price decrease over time.
     */
    SeasonPassLastSaleAt: {
      key: [],
      schema: {
        lastSaleAt: "uint256",
      },
    },

    /**
     * Record of season pass sales.
     * Used for analytics and tax purposes.
     */
    SeasonPassSale: {
      type: "offchainTable",
      key: ["buyer", "tokenId"],
      schema: {
        buyer: "address",
        tokenId: "uint256",
        price: "uint256",
        purchasedAt: "uint256",
        tokenAddress: "address",
      },
    },

    // ______________________ MATCH ____________________________

    /**
     * Counter for match-specific entities, used to derive a bytes32 entity via `encodeMatchEntity`.
     * We'll use this as a fallback in case we don't ship match composite keys in time.
     */
    MatchEntityCounter: {
      key: ["matchEntity"],
      schema: {
        matchEntity: "bytes32",
        // ~4 billion entities per match seems like plenty for now
        entityCounter: "uint32",
      },
    },
    /**
     * Stores the number of matches that are created in a day.
     * Calculated using block.timestamp / 86400
     */
    MatchesPerDay: {
      key: ["day"],
      schema: {
        day: "uint256",
        value: "uint256",
      },
    },
    /**
     * Used to keep track of all the instantiated SpawnPoints in a match.
     */
    MatchSpawnPoints: "bytes32[]",
    /**
     * Kept up to date with all of the player entities present in a Match.
     */
    MatchPlayers: "bytes32[]",
    /**
     * Match data for SkyPool
     */
    MatchSky: {
      key: ["matchEntity"],
      schema: {
        matchEntity: "bytes32",
        createdAt: "uint256",
        reward: "uint256",
      },
    },
    /**
     * Match Name set by match creator.
     */
    MatchName: {
      key: ["matchEntity"],
      schema: {
        matchEntity: "bytes32",
        value: "string",
      },
    },
    /**
     * Match gameplay settings.
     */
    MatchConfig: {
      key: ["matchEntity"],
      schema: {
        matchEntity: "bytes32",
        registrationTime: "uint256",
        startTime: "uint256",
        turnLength: "uint256",
        levelId: "bytes32",
        createdBy: "bytes32",
        escrowContract: "address",
      },
    },
    /**
     * Match access control resource and function selector.
     */
    MatchAccessControl: {
      key: ["matchEntity"],
      schema: {
        matchEntity: "bytes32",
        systemId: "ResourceId",
      },
    },
    MatchAllowed: {
      key: ["matchEntity", "account"],
      schema: {
        matchEntity: "bytes32",
        account: "address",
        value: "bool",
      },
    },
    /**
     * Whether a match has finished.
     */
    MatchFinished: "bool",
    MatchMapCopyProgress: "uint256",
    /**
     * Time when match Level copying is completed.
     */
    MatchReady: "uint256",
    /**
     * The ordered ranks of each player in the match.
     */
    MatchRanking: {
      key: ["matchEntity"],
      schema: {
        matchEntity: "bytes32",
        value: "bytes32[]",
      },
    },

    MatchSweepstake: {
      key: ["matchEntity"],
      schema: {
        matchEntity: "bytes32",
        entranceFee: "uint256",
        rewardPercentages: "uint256[]",
      },
    },

    /**
     * The rewards for each place (1st, 2nd etc...) of match players.
     */
    MatchReward: {
      key: ["entity", "rank"],
      schema: {
        entity: "bytes32",
        rank: "uint256",
        value: "uint256",
      },
    },

    // ______________________ TEMPLATES + LEVELS ____________________________

    /**
     * Stores the table IDs a template is composed of.
     */
    TemplateTables: "bytes32[]",
    /**
     * Stores the content of each record in a template.
     */
    TemplateContent: {
      key: ["templateId", "tableId"],
      schema: {
        templateId: "bytes32",
        tableId: "ResourceId",

        encodedLengths: "EncodedLengths",
        staticData: "bytes",
        dynamicData: "bytes",
      },
    },
    /**
     * Stores the template for each index in a level.
     */
    LevelTemplates: "bytes32[]",
    /**
     * Stores the indices of Level entities with a given `templateId`.
     */
    LevelTemplatesIndex: {
      key: ["levelId", "templateId"],
      schema: {
        levelId: "bytes32",
        templateId: "bytes32",
        value: "uint256[]",
      },
    },
    /**
     * Stores the position of each level index.
     */
    LevelPosition: {
      key: ["levelId", "index"],
      schema: {
        levelId: "bytes32",
        index: "uint256",

        x: "int32",
        y: "int32",
      },
    },
    /**
     * Stores the indices of Level entities with the given position.
     */
    LevelPositionIndex: {
      key: ["levelId", "x", "y"],
      schema: {
        levelId: "bytes32",
        x: "int32",
        y: "int32",
        value: "uint256[]",
      },
    },
    /**
     * Whether a template is "virtual", meaning it is not instantiated during Level copying.
     */
    VirtualLevelTemplates: {
      key: ["templateId"],
      schema: {
        templateId: "bytes32",
        value: "bool",
      },
    },
  },
});
