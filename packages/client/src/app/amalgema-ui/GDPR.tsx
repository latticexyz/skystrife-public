import React, { useEffect, useState } from "react";
import { Card } from "../ui/Theme/SkyStrife/Card";
import { Body, Link, OverlineLarge } from "../ui/Theme/SkyStrife/Typography";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { ANALYTICS_URL } from "../../layers/Network/utils";
import useLocalStorageState from "use-local-storage-state";

const GDPR: React.FC = () => {
  const [show, setShow] = useState(false);
  const [accepted, setAccepted] = useLocalStorageState("gdpr-accepted", {
    defaultValue: false,
  });

  useEffect(() => {
    fetch(ANALYTICS_URL + "/is-eu", {})
      .then((r) => {
        console.log(r.status);

        if (r.status != 200) {
          setShow(true);
          return;
        }

        r.json().then((data) => {
          setShow(data.isEu);
        });
      })
      .catch(() => {
        setShow(true);
      });
  }, []);

  return (
    <>
      {!accepted && show && (
        <Card primary={true} className="fixed bottom-4 left-4 p-4 bg-white w-[480px]">
          <div className="flex flex-col gap-y-2">
            <OverlineLarge>Cookie Consent Notice</OverlineLarge>

            <Body>
              This website uses cookies to enhance your experience and ensure the site functions properly. Please be
              aware that we do not use marketing cookies. All cookies deployed are strictly necessary for the operation
              of this website. By continuing to browse our site, you agree to the use of these essential cookies. For
              more information, please review our{" "}
              <Link style={{ fontSize: "14px" }} href={"/privacy-policy"}>
                Privacy Policy
              </Link>
            </Body>

            <div className="flex items-center">
              <input type="checkbox" id="necessary-cookies" className="mr-2" checked={true} disabled={true} />
              <label htmlFor="necessary-cookies">Essential cookies</label>
            </div>

            <Button onClick={() => setAccepted(true)} buttonType="primary">
              I accept the use of cookies
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default GDPR;
