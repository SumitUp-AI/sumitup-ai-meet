import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { MeetingProvider } from "./context/MeetingContext";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <MeetingProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </MeetingProvider>
  </AuthProvider>,
);
