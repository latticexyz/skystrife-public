export const DelegationAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatee",
        type: "address",
      },
      {
        internalType: "ResourceId",
        name: "systemId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "numCalls",
        type: "uint256",
      },
    ],
    name: "initDelegation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
