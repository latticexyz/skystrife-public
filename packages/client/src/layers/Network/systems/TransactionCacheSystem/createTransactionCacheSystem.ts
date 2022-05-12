import { Entity, Has, UpdateType, defineSystem, getComponentValueStrict, setComponent } from "@latticexyz/recs";
import { NetworkLayer } from "../../types";
import { TransactionDB } from "../../TransactionDB";

export function createTransactionCacheSystem(layer: NetworkLayer, txDb: TransactionDB) {
  const {
    world,
    components: { Transaction },
  } = layer;

  const txsFromDb = new Set<Entity>();

  defineSystem(world, [Has(Transaction)], async ({ entity, type }) => {
    // this is a transaction that was loaded from the db
    // do not re-insert it
    if (txsFromDb.has(entity)) return;

    if ([UpdateType.Update, UpdateType.Enter].includes(type)) {
      const txData = getComponentValueStrict(Transaction, entity);
      const existingTx = await txDb.transactions.get(entity);

      try {
        if (existingTx) {
          await txDb.transactions.update(entity, {
            ...txData,
          });
          return;
        } else {
          await txDb.transactions.add(
            {
              key: entity,
              ...txData,
            },
            entity
          );
        }
      } catch (e) {
        // console.error(e);
      }
    }
  });

  // on load, load all transactions from the db
  const loadExistingTransactions = async () => {
    const transactions = await txDb.transactions.toArray();
    transactions.forEach((tx) => {
      txsFromDb.add(tx.key);
      setComponent(Transaction, tx.key, {
        entity: tx.entity,
        systemCall: tx.systemCall,
        gasEstimate: tx.gasEstimate,
        manualGasEstimate: tx.manualGasEstimate,
        status: tx.status,
        hash: tx.hash,
        error: tx.error,
        submittedBlock: tx.submittedBlock,
        completedBlock: tx.completedBlock,
        submittedTimestamp: tx.submittedTimestamp,
        completedTimestamp: tx.completedTimestamp,
      });
    });
  };

  loadExistingTransactions();
}
