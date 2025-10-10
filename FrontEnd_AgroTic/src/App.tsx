import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { PermissionProvider } from "./contexts/PermissionContext";

function App() {
  return (
    <BrowserRouter>
      <PermissionProvider>
        <AppRouter />
      </PermissionProvider>
    </BrowserRouter>
  );
}

export default App;
