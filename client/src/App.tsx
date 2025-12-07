import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { TransactionResultPage } from "./pages/TransactionResultPage";
import { DenahPage } from "./pages/DenahPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/denah" element={<DenahPage />} />
        <Route path="/transaction/:id" element={<TransactionResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
