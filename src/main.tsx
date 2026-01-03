import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// 1. IMPORT THIS
import { AuthProvider } from "@/context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* 2. WRAP THE APP HERE */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
