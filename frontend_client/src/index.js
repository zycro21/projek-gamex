import React from "react";
import ReactDOM from "react-dom/client"; // Perbarui impor ini
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")); // Ganti render dengan createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);