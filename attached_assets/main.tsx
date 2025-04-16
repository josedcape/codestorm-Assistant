import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
<<<<<<< HEAD
import { loader as monacoLoader } from "@monaco-editor/react";

// Initialize Monaco loader to use CDN version
monacoLoader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/min/vs",
  },
});

createRoot(document.getElementById("root")!).render(<App />);
=======

createRoot(document.getElementById("root")!).render(
  <App />
);
>>>>>>> 132aeba36e2ea9de048066f0f5011c34e421d7d7
