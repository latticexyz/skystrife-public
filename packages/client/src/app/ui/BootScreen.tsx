import React from "react";
import styled from "styled-components";
import { Card } from "./Theme/SkyStrife/Card";
import { OverlineLarge } from "./Theme/SkyStrife/Typography";

type Props = {
  initialOpacity?: number;
  children: React.ReactNode;
};

export const BootScreen = ({ children }: Props) => {
  return (
    <Container
      style={{
        zIndex: 1000,
        background: "linear-gradient(rgba(24, 23, 16, 0.4), rgba(24, 23, 16, 0.4)), url(assets/ss-splash-min.png)",
        backgroundPosition: "right",
        backgroundSize: "cover",
      }}
    >
      <div className="flex flex-col items-center justify-stretch pointer-events-auto">
        <Card primary className="h-fit w-[500px]">
          <div className="rounded p-8">
            <OverlineLarge
              style={{
                fontSize: "80px",
                lineHeight: "110%",
                letterSpacing: "-2%",
              }}
              className="normal-case text-center"
            >
              Sky Strife
            </OverlineLarge>

            <div>
              <>{children || <>&nbsp;</>}</>
            </div>
          </div>
        </Card>

        {/* <Card primary className="mt-3 h-fit text-center w-[500px]">
          <div className="p-4">
            <Heading>Sky Strife is in the early stages of development</Heading>
            <Body>
              If you experience bugs, please report them in the feedback channel of our{" "}
              <Link
                className="underline"
                href={DISCORD_URL}
                rel="noreferrer"
              >
                Discord
              </Link>
              .
            </Body>
          </div>
        </Card>
            */}

        <div className="h-4"></div>

        <img className="ml-2 w-[500px]" src="/public/assets/unit-stats.png" style={{ width: "500px" }}></img>
      </div>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgb(0 0 0 / 100%);
  display: grid;
  align-content: center;
  align-items: center;
  justify-content: center;
  justify-items: center;
  transition: all 2s ease;
  grid-gap: 50px;
  z-index: 100;
  pointer-events: none;
  color: white;

  img {
    width: 100px;
  }
`;
