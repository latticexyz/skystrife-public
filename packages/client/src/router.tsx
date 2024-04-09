import { createBrowserRouter } from "react-router-dom";
import { SkyStrife } from "./app/SkyStrife";
import { DesignSystem } from "./app/DesignSystem";
import { Amalgema } from "./app/Amalgema";
import { Admin } from "./app/Admin";
import PrivacyPolicy from "./app/PrivacyPolicy";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Amalgema />,
  },
  {
    path: "/match",
    element: <SkyStrife />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/design-system",
    element: <DesignSystem />,
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />,
  },
]);
