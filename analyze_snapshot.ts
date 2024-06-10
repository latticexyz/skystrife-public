/**
 * Script used to analyze snapshots from the indexer.
 *
 * Usage: tsx analyze_snapshot.ts <snapshot_file_name>
 */

import fs from "fs";

interface LogEntry {
  address: string;
  eventName: string;
  args: {
    tableId: string;
    keyTuple: string[];
    staticData: string;
    encodedLengths: string;
    dynamicData: string;
  };
}

interface LogData {
  logs: LogEntry[];
}

const tableData = fs.readFileSync("all_tables.json");
const tables = JSON.parse(tableData);

function getTableName(tableId) {
  const table = tables.find((t) => t.tableId === tableId);
  return table ? table.name : "Table not found";
}

// Take snapshot file name from command line argument
const snapshotFileName = process.argv[2]; // Assuming the first argument is the file name

// Read the JSON file using the command line argument
const rawData = fs.readFileSync(snapshotFileName, "utf8");
const data: LogData = JSON.parse(rawData);

// Function to count logs per table ID
function countLogsPerTableId(logs: LogEntry[]): Map<string, number> {
  const tableIdCounts = new Map<string, number>();

  logs.forEach((log) => {
    const tableId = log.args.tableId;
    if (tableIdCounts.has(tableId)) {
      tableIdCounts.set(tableId, tableIdCounts.get(tableId)! + 1);
    } else {
      tableIdCounts.set(tableId, 1);
    }
  });

  return tableIdCounts;
}

// Get the counts
const counts = countLogsPerTableId(data.logs);

// Convert the map to an array and sort it in descending order based on count
const sortedCounts = Array.from(counts).sort((a, b) => b[1] - a[1]);

// Display the sorted counts
console.log("Counts of logs per table ID in descending order:");
sortedCounts.forEach(([tableId, count]) => {
  console.log(`${getTableName(tableId)}: ${count}`);
});
