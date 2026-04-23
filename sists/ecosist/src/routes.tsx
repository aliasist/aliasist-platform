import { Routes, Route } from "react-router-dom";
import { EcoSistHome } from "./pages/EcoSistHome";

export const EcoSistRoutes = () => (
  <Routes>
    <Route path="/" element={<EcoSistHome />} />
  </Routes>
);
