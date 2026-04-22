import { Routes, Route } from "react-router-dom";
import { DataSistHome } from "./pages/DataSistHome";
import { DataSistAdmin } from "./pages/DataSistAdmin";

export const DataSistRoutes = () => (
  <Routes>
    <Route path="/" element={<DataSistHome />} />
    <Route path="/admin" element={<DataSistAdmin />} />
  </Routes>
);
