import React from "react";
import { AuthProvider } from "./context/Authcontext";
import AppRoutes from "./Routes/Routes";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;