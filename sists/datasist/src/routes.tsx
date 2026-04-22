import { Routes, Route } from "react-router-dom";
import { DataSistHome } from "./pages/DataSistHome";

export const DataSistRoutes = () => (
  <Routes>
    <Route path="/" element={<DataSistHome />} />
  </Routes>
);
