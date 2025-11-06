import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import "./App.css";
import Index from "./pages/Index";
import Layout from "./components/Layout";
import Books from "./pages/Books";
import Authors from "./pages/Authors";
import BookDetail from "./pages/BookDetail";
import AuthorDetail from "./pages/AuthorDetail";
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import PasswordResetDone from "./pages/PasswordResetDone";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import MyBorrowed from "./pages/MyBorrowed";
import CreateBook from "./pages/CreateBook";
import CreateAuthor from "./pages/CreateAuthor";
import EditBook from "./pages/EditBook";
import Registration from "./pages/Registration";
import { useEffect } from "react";

async function ensureCsrfCookie() {
  await fetch("http://127.0.0.1:8000/api/csrf/", {
    method: "GET",
    credentials: "include",
  });
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="books" element={<Books />} />
          <Route path="authors" element={<Authors />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="authors/:id" element={<AuthorDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="password-reset" element={<PasswordReset />} />
          <Route path="password-reset-done" element={<PasswordResetDone />} />
          <Route path="reset/:uid/:token" element={<PasswordResetConfirm />} />
          <Route path="my-borrowed" element={<MyBorrowed />} />
          <Route path="create-book" element={<CreateBook />} />
          <Route path="create-author" element={<CreateAuthor />} />
          <Route path="books/:id/edit" element={<EditBook />} />
          <Route path="register" element={<Registration />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  useEffect(() => {
    ensureCsrfCookie();
  }, []);
  return (
    <BrowserRouter basename="/catalog">
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
