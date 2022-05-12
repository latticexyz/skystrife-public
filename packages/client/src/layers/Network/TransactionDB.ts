import { Entity } from "@latticexyz/recs";
import Dexie, { Table } from "dexie";

export class TransactionDB extends Dexie {
  // this type is hardcoded to match the Transaction
  // component defintion
  transactions!: Table<{
    key: Entity;
    entity?: Entity;
    systemCall: string;
    gasEstimate?: bigint;
    manualGasEstimate: boolean;
    status: string;
    hash?: string;
    error?: string;
    submittedBlock?: bigint;
    completedBlock?: bigint;
    submittedTimestamp?: bigint;
    completedTimestamp?: bigint;
  }>;

  constructor(worldAddress: string, chainId: number) {
    super(`transactions-${worldAddress}-${chainId}`);
    this.version(1).stores({
      transactions:
        "key, entity, systemCall, gasEstimate, manualGasEstimate, status, hash, error, submittedBlock, completedBlock, submittedTimestamp, completedTimestamp",
    });
  }
}
