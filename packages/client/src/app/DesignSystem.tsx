import { Body, Caption, Heading, OverlineLarge, OverlineSmall } from "./ui/Theme/SkyStrife/Typography";
import { Card } from "./ui/Theme/SkyStrife/Card";
import { IconButton } from "./ui/Theme/SkyStrife/IconButton";
import { Discord } from "./ui/Theme/SkyStrife/Icons/Discord";
import { Button } from "./ui/Theme/SkyStrife/Button";

export function DesignSystem() {
  return (
    <div className="bg-slate-200 min-h-screen h-fit">
      <div className="p-8">
        <OverlineLarge>Buttons</OverlineLarge>
        <Button buttonType="primary">Primary</Button> &nbsp;
        <Button buttonType="primary" size="lg">
          Primary Large
        </Button>{" "}
        &nbsp;
        <Button buttonType="primary" disabled>
          Disabled
        </Button>
        <br />
        <br />
        <Button buttonType="secondary">Secondary Medium</Button>&nbsp;
        <Button buttonType="secondary" disabled>
          Disabled
        </Button>
        <br />
        <br />
        <Button buttonType="tertiary">Tertiary</Button>&nbsp;
        <Button buttonType="tertiary" disabled>
          Disabled
        </Button>
      </div>

      <div className="w-full border border-solid border-black/10"></div>

      <div className="p-8">
        <OverlineLarge className="mb-2">Typography</OverlineLarge>

        <OverlineLarge>Overline Large</OverlineLarge>
        <OverlineSmall>Overline Small</OverlineSmall>
        <Heading>Heading</Heading>
        <Body>Body</Body>
        <Caption>Caption</Caption>
      </div>

      <div className="w-full border border-solid border-black/10"></div>

      <div className="p-8">
        <OverlineLarge className="mb-2">Cards</OverlineLarge>

        <Card primary>
          <OverlineLarge>Card / Primary</OverlineLarge>

          <div className="mb-4"></div>

          <Button buttonType="secondary" className="w-full">
            Join
          </Button>
          <div className="mb-2"></div>
          <Button buttonType="tertiary" className="w-full">
            Spectate
          </Button>
        </Card>

        <div className="mb-4"></div>

        <Card primary={false}>
          <OverlineLarge>Card / Primary</OverlineLarge>

          <div className="mb-4"></div>
          <Button buttonType="tertiary" className="w-full">
            Spectate
          </Button>
        </Card>
      </div>

      <div className="p-8">
        <OverlineLarge className="mb-2">Icon Buttons</OverlineLarge>

        <IconButton>
          <Discord />
        </IconButton>
      </div>
    </div>
  );
}
