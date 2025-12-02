import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { TransactionResultPage } from "./pages/TransactionResultPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/transaction/:uuid" element={<TransactionResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
