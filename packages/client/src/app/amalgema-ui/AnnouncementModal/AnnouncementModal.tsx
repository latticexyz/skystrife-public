import { Body, Heading, Link, OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { Modal } from "../Modal";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import * as Dialog from "@radix-ui/react-dialog";
import useLocalStorageState from "use-local-storage-state";

export function AnnouncementModal() {
  const [seenPatchNotes, setSeenPatchNotes] = useLocalStorageState("viewed-patch-notes-mainnet", {
    defaultValue: false,
  });

  return (
    <div className="uppercase w-fit px-4 flex items-center">
      <Modal
        footer={
          <Dialog.Close asChild={true} className="w-fit">
            <Button className="mx-auto" buttonType="primary">
              start playing
            </Button>
          </Dialog.Close>
        }
        title="announcements"
        trigger={
          <div onClick={() => setSeenPatchNotes(true)} className="relative">
            <Button buttonType="tertiary">read announcements</Button>

            {!seenPatchNotes && (
              <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full animate-ping bg-red-500" />
            )}
          </div>
        }
      >
        <Heading>Redstone mainnet launch!</Heading>
        <OverlineSmall>May 1st, 2024</OverlineSmall>

        <Heading className="mt-6 mb-4 font-bold text-ss-text-default">🚀 Season 1 Begins 🚀</Heading>
        <p className="text-ss-text-light">
          The day has finally come. Sky Strife is officially released on{" "}
          <Link style={{ fontSize: "16px" }} href="https://redstone.xyz">
            Redstone
          </Link>
          .
        </p>

        <br />

        <p className="text-ss-text-light">
          Season 1 runs from May 1st to May 31st and the first Season Pass is available to mint until May 4th. The price
          is a fixed 0.03 ETH.
        </p>

        <br />

        <p className="text-ss-text-light">
          We would like to give a HUGE thank you to all of our playtesters over the past couple years. Sky Strife could
          not have become the game it is today without your support, feedback, and insane amounts of matches played.
        </p>

        <br />

        <p className="text-ss-text-light">
          This all started as a dream to create a game with no owner. A World with no God. It is up to you, the players,
          to mold Sky Strife in any way you choose. The possibilities are endless.
        </p>

        <br />

        <p className="text-ss-text-light text-center text-sm mt-2">
          A screenshot from the first internal build of Sky Strife. Taken on August 22nd, 2022.
        </p>
        <img src="/public/assets/first_sky_strife_playtest.png" />

        <div className="h-32"></div>

        <Heading>Final testnet season — and plugins!</Heading>
        <OverlineSmall>Mar 19th, 2024</OverlineSmall>

        <Heading className="mt-6 mb-4 font-bold text-ss-text-default">FINAL TESTNET SEASON</Heading>
        <div className="text-ss-text-light">
          <p>
            This season, Season 0.3, will be the final testnet season before we release on Redstone Mainnet.
            <br />
            <br />
            That&apos;s right — mainnet.
            <br />
            No more testnet, no more Holesky ETH. Just the real stuff.
            <br />
            <br />
            Enough about that for now, though. We have much more to share about this in the coming months.
          </p>
        </div>

        <Heading className="mt-6 mb-4 font-bold text-ss-text-default">PLUGINS!?</Heading>
        <div className="text-ss-text-light">
          <p>
            We&apos;re excited to announce plugins — a way to experience Sky Strife in a completely different way.
            <br />
            <br />
            You can access plugins, in-game, at the top-right of your screen with the plugin icon. Once there you can
            enable or disable plugins for use during your match.
          </p>
          <img
            className="my-4"
            src="/public/assets/plugins.png"
            alt="Showing the location of plugins in the top-right of the screen with a red arrow"
          />
          <img className="my-4" src="/public/assets/plugin-manager.png" alt="Showing plugin manager when it is open" />

          <ul className="list-disc list-inside text-ss-text-light">
            <li>Added client plugins</li>
            <li>Added three core plugins built by the Sky Strife team:</li>
            <ul className="ml-4 list-disc list-inside text-ss-text-light">
              <li>
                <span className="font-bold text-ss-text-default">Frenzy (default)</span>: press f to make the most
                powerful attack available for your selected unit.
                <img
                  className="my-4"
                  src="/public/assets/frenzy.gif"
                  alt="The frenzy plugin in action, showing a player pressing `f` to attack a nearby unit with a strong attack."
                />
              </li>
              <li>
                <span className="font-bold text-ss-text-default">Opponent Gold (default)</span>: view your
                opponents&apos; current amount of gold. No more surprise attacks!
              </li>
              <li>
                <span className="font-bold text-ss-text-default">Action Log</span>: view more detailed transaction
                information
              </li>
            </ul>
            <li>More community plugins on the way!</li>
          </ul>
        </div>
        <div className="h-32"></div>

        <Heading>New units, combat redesign, and more!</Heading>
        <OverlineSmall>Feb 23rd, 2024</OverlineSmall>

        <Heading className="mt-6 mb-4 font-bold text-ss-text-default">COUNTERS</Heading>
        <ul className="list-disc list-inside text-ss-text-light">
          <li>
            Each unit type (Swordsman, Archer, etc.) now has a set of advantages and disadvantages against other units
          </li>
          <li>
            These damage multipliers range anywhere from{" "}
            <span className="font-bold text-ss-text-default">0.5x to 2.5x</span> damage!
          </li>
          <li>
            For example, <span className="font-bold text-ss-text-default">Knights</span> now one-shot-kill{" "}
            <span className="font-bold text-ss-text-default">Archers</span> and{" "}
            <span className="font-bold text-ss-text-default">Pillagers</span>, and{" "}
            <span className="font-bold text-ss-text-default">Archers</span> now one-shot-kill{" "}
            <span className="font-bold text-ss-text-default">Swordsmen</span>!
          </li>
        </ul>
        <Body className="mt-4">See below for a detailed look at how units counter each other! </Body>
        <div className="px-8 py-4">
          <img src="/public/assets/rps-diagram.png" alt="Rock-Paper-Scissors Unit Diagram" />
        </div>

        <Heading className="mt-6 mb-4 font-bold text-ss-text-default">NEW UNITS</Heading>
        <div className="text-ss-text-light">
          <p>
            <span className="font-bold text-ss-text-default">The Brute</span>: The second most expensive unit, slow,
            tanky, and very strong against all other melee units (especially Swordsmen and Knights). Very vulnerable to
            Archers and Catapults.
          </p>
          <div className="px-8 py-4">
            <img src="/public/assets/brute.png" alt="Brute sprite" />
          </div>
          <p>
            <span className="font-bold text-ss-text-default">The Catapult</span>: The most expensive unit, slow, not so
            tanky, and can attack only while stationary. Vulnerable to Pillagers and Knights but strongest against
            Brutes and Structures.
          </p>
          <div className="px-8 py-4">
            <img src="/public/assets/catapult.png" alt="Catapult sprite" />
          </div>
        </div>

        <Heading className="mt-6 mb-4 font-bold text-ss-text-default">LATENCY IMPROVEMENTS</Heading>
        <p className="text-ss-text-light">
          Making the game a better experience for players all across the globe is a high priority for us, so we&apos;ve
          upgraded the client in a way that will reduce the competitive edge that players with low ping have over
          players with high ping.
        </p>

        <Heading className="mt-6 mb-4 font-bold text-ss-text-default">UI IMPROVEMENTS</Heading>
        <div className="mt-6 mb-4 text-ss-text-light">
          <p className="text-ss-text-default mb-2 font-medium">Combat preview</p>
          <ul className="list-disc list-inside">
            <li>See a flashing skull when an attacker or defender will die from an attack.</li>
            <li>See an up or down arrow based on whether an attack is advantageous or disadvantageous.</li>
            <li>See the armor bonus units receive from the terrain they&apos;re standing on</li>
            <li>New health bars that will improve their legibility</li>
          </ul>
          <p className="text-ss-text-default mb-2 mt-4 font-medium">Unit/Structure Inspect Panel</p>
          <ul className="list-disc list-inside">
            <li>See terrain bonuses a unit currently has.</li>
            <li>See whether or not a unit is ready to move + attack!</li>
            <li>See health remaining on units and structures, and gold remaining on structures</li>
          </ul>
        </div>
        <div className="px-8 py-4">
          <img src="/public/assets/combat-ui.gif" alt="a GIF of a combat preview" />
        </div>

        <Heading className="mt-6 mb-4 font-bold text-ss-text-default">OTHER CHANGES</Heading>
        <div className="mt-6 mb-4 text-ss-text-light">
          <ul className="list-disc list-inside ml-4">
            <li>
              Gold amounts, across the board, were reduced by 4x for simplicity (e.g., a unit costing 400g is now 100g,
              mines giving 200g is now 50g, etc.).
            </li>
            <li>Each hero has been assigned a class so that its damage multipliers align with units:</li>
            <li>Pikeman → Halberdier (Anti-cavalry)</li>
            <li>Archer → Marksman (Ranged infantry)</li>
            <li>Knight → Dragoon (Cavalry)</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}
