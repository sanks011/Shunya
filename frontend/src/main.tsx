import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
    <Toaster position="top-right" richColors />
  </ThemeProvider>
);
