import "tailwindcss/tailwind.css";
import ReactDOM from "react-dom/client";
import { router } from "./router";
import { RouterProvider } from "react-router-dom";
import { Providers } from "./app/Providers";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <Providers>
    <RouterProvider router={router} />
  </Providers>
);
