import { Routes, Route } from "react-router-dom";
import { SpaceSistHome } from "./pages/SpaceSistHome";

export const SpaceSistRoutes = () => (
  <Routes>
    <Route path="/" element={<SpaceSistHome />} />
  </Routes>
);
