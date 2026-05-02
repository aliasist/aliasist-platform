import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { applyTheme, readStoredTheme } from "@aliasist/ui";
import "@aliasist/ui/styles.css";
import "./styles/tailwind.css";

applyTheme(readStoredTheme() ?? "lab");

const root = document.getElementById("root");
if (!root) throw new Error("missing #root element");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
