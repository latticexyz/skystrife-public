import { useState } from "react";
import { useFilePicker } from "use-file-picker";
import { useAmalgema } from "../../../useAmalgema";
import { Level, bulkUploadMap } from "./bulkUploadMap";
import { Button } from "../Theme/SkyStrife/Button";
import { OverlineSmall } from "../Theme/SkyStrife/Typography";
import { encodeFunctionData, maxUint256 } from "viem";
import { LEVEL_UPLOAD_SYSTEM_ID, SYSTEMBOUND_DELEGATION } from "../../../constants";
import { useExternalAccount } from "../../amalgema-ui/hooks/useExternalAccount";
import { DelegationAbi } from "./delegationAbi";

export const MapUpload = () => {
  const networkLayer = useAmalgema();
  const {
    externalWalletClient,
    externalWorldContract,
    network: { walletClient },
    utils: { hasSystemDelegation },
  } = networkLayer;

  const { address } = useExternalAccount();
  const [openFileSelector, fileData] = useFilePicker({
    accept: ".json",
  });
  const [sendingTxs, setSendingTxs] = useState(false);
  const [name, setName] = useState("");

  const { filesContent, loading } = fileData;

  const hasDelegation = address
    ? hasSystemDelegation(address, walletClient.account.address, LEVEL_UPLOAD_SYSTEM_ID)
    : false;

  return (
    <form
      className="flex flex-col"
      onSubmit={async (event) => {
        event.preventDefault();
        if (externalWalletClient && externalWalletClient.account) {
          setSendingTxs(true);
          try {
            await bulkUploadMap(
              networkLayer,
              externalWalletClient.account.address,
              JSON.parse(filesContent[0].content) as Level,
              name
            );
          } finally {
            setSendingTxs(false);
          }
        }
      }}
    >
      <div className="flex flex-row">
        <div className="border border-gray-900 m-1 p-1">
          <OverlineSmall>Step 0: delegate to operator</OverlineSmall>
          <div className="flex flex-col m-2">
            <Button
              buttonType="primary"
              disabled={hasDelegation}
              onClick={() => {
                if (externalWorldContract && externalWalletClient && externalWalletClient.account) {
                  externalWorldContract.write.registerDelegation(
                    [
                      walletClient.account.address,
                      SYSTEMBOUND_DELEGATION,
                      encodeFunctionData({
                        abi: DelegationAbi,
                        functionName: "initDelegation",
                        args: [walletClient.account.address, LEVEL_UPLOAD_SYSTEM_ID, maxUint256],
                      }),
                    ],
                    {
                      account: externalWalletClient.account,
                    }
                  );
                }
              }}
            >
              Delegate
            </Button>
          </div>
        </div>
        <div className="border border-gray-900 m-1 p-1">
          <OverlineSmall>Step 1: upload file</OverlineSmall>
          <div className="flex flex-col h-32 m-2">
            <Button buttonType="primary" onClick={openFileSelector}>
              Choose Level File
            </Button>
            {filesContent && (
              <div>
                {filesContent.map((file) => (
                  <div key={file.name}>{file.name}</div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="border border-gray-900 m-1 p-1">
          <OverlineSmall>Step 2: choose name</OverlineSmall>
          <div className="flex flex-col h-32 m-2">
            <input type="text" placeholder="Level Name" onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
      </div>
      {loading && <div>Loading...</div>}

      <Button type="submit" disabled={sendingTxs || name === "" || !filesContent[0]} buttonType="primary">
        Upload!
      </Button>
    </form>
  );
};
