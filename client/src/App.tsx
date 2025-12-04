import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { TransactionResultPage } from "./pages/TransactionResultPage";
import { Dashboard } from "./pages/Dashboard";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transaction/:id" element={<TransactionResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
