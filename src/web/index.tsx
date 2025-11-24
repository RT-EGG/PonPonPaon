import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "../store";
import { App } from "./App";
import { SharedStateProvider } from "../contexts/SharedStateContext";

createRoot(document.getElementById("root") as Element).render(
    <StrictMode>
        <SharedStateProvider>
            <App />
        </SharedStateProvider>
    </StrictMode>
);
