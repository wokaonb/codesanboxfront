import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@arco-design/web-react/dist/css/arco.css";
import "./index.css";
import router from "./router";
import { initializeApp } from "./init";

initializeApp();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
