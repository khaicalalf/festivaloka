import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css"; // kalau pakai Tailwind atau CSS sendiri

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
