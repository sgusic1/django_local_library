import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./navigation.css";
import "./index.css";
import "./BookCard.css";
import "./Pagination.css";
import "./AuthorCard.css";
import "./BookCardDetail.css";
import "./Copies.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
