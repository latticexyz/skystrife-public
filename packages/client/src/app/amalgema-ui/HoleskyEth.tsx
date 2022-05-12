import { Button } from "../ui/Theme/SkyStrife/Button";
import { useState } from "react";
import { Modal } from "./Modal";
import { Body, Link } from "../ui/Theme/SkyStrife/Typography";
import { DISCORD_URL } from "../links";

export function HoleskyEth() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-start self-stretch rounded-sm border border-ss-stroke bg-ss-bg-0">
      <Modal
        open={modalOpen}
        setOpen={setModalOpen}
        title={`Holesky ETH`}
        trigger={
          <Button buttonType="secondary" size="md" className="w-full">
            Need Holesky ETH?
          </Button>
        }
        footer={
          <div className="flex space-x-4 w-full">
            <a href={DISCORD_URL} className="w-full" target="_blank" rel="noreferrer">
              <Button onClick={() => setModalOpen(false)} buttonType="tertiary" className="w-full">
                Need help?
              </Button>
            </a>
            <Button onClick={() => setModalOpen(false)} buttonType="secondary" className="w-full">
              Okay, I&apos;m all set!
            </Button>
          </div>
        }
      >
        <Body className="text-ss-text-default">
          Looks like you don’t have any Holesky ETH on Redstone. We can help!
        </Body>
        <Body className="text-ss-text-default">
          <ul className="list-disc ml-8 my-4">
            <li>
              Visit one of the following faucets:
              <ul className="list-decimal ml-8">
                <li>
                  <Link href="https://holesky-faucet.pk910.de">holesky faucet</Link>
                </li>
                <li>
                  <Link href="https://faucet.quicknode.com/ethereum">quicknode</Link>
                </li>
                <li>
                  <Link href="https://stakely.io/en/faucet/ethereum-holesky-testnet-eth">stakely</Link>
                </li>
              </ul>
            </li>
            <li>
              Visit the <Link href="https://redstone.xyz/deposit">Redstone Bridge</Link> and deposit your Holesky ETH to
              Redstone.
            </li>
            <li>
              Come back to <Link href="https://playtest.skystrife.xyz">https://playtest.skystrife.xyz</Link>, fund your
              session wallet, and join your first match!
            </li>
          </ul>
        </Body>
      </Modal>
    </div>
  );
}
