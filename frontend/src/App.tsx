import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import Layout from "./components/Layout";
import Books from "./pages/Books";
import Authors from "./pages/Authors";
import BookDetail from "./pages/BookDetail";

function App() {
  return (
    <>
      <BrowserRouter basename="/catalog">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="books" element={<Books />} />
            <Route path="authors" element={<Authors />} />
            <Route path="books/:id" element={<BookDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
