import useLocalStorageState from "use-local-storage-state";
import { Tooltip } from "react-tooltip";

export function AnalyticsConsentForm() {
  const [analyticsConsent, setAnalyticsConsent] = useLocalStorageState("analytics-consent", {
    defaultValue: true,
  });

  return (
    <>
      <div className="flex flex-row justify-around">
        <label
          style={{
            borderBottom: "2px dotted #000",
          }}
          htmlFor="analytics-consent"
          className=""
          data-tooltip-id="analytics-consent-tooltip"
          data-tooltip-content="Gameplay analytics contain information about the transactions your client attempts to send to the blockchain.
          We use this information to improve the stability, cost, and performance of Sky Strife. We do not collect any
          personal or identifying information."
        >
          I consent to send client gameplay analytics to help improve Sky Strife.
        </label>
        <input
          id="analytics-consent"
          type="checkbox"
          className=""
          checked={analyticsConsent}
          onChange={(e) => setAnalyticsConsent(e.target.checked)}
        />
      </div>

      <Tooltip
        style={{
          width: "320px",
        }}
        opacity={1}
        id="analytics-consent-tooltip"
      />
    </>
  );
}
