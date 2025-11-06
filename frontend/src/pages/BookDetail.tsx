import type { Book } from "../types";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import BookDetailCard from "../components/BookDetailCard";
import { motion } from "motion/react";
import type { User } from "../types";

function BookDetail() {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem("currentUser");
    return cached ? JSON.parse(cached) : null;
  });

  useEffect(() => {
    const cached = localStorage.getItem("currentUser");
    if (cached) setUser(JSON.parse(cached));

    async function loadUser() {
      try {
        const res = await fetch("/api/currentuser/", {
          credentials: "include",
        });
        if (res.status === 401) {
          setUser(null);
          localStorage.removeItem("currentUser");
          return;
        }

        const data: User = await res.json();
        setUser(data);
        localStorage.setItem("currentUser", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }

    loadUser();
  }, []);

  const [book, setBook] = useState<Book | null>(null);
  const { id } = useParams();
  const url = `http://127.0.0.1:8000/api/books/${id}/`;

  useEffect(() => {
    const cashed = localStorage.getItem("bookDetail");
    if (cashed) {
      const parsed = JSON.parse(cashed) as Book;
      setBook(parsed);
    }
    fetch(url)
      .then((res) => res.json())
      .then((data: Book) => {
        setBook(data);
        localStorage.setItem("bookDetail", JSON.stringify(data || null));
      });
  }, []);

  async function handleDelete() {
    if (!book) return;
    if (!confirm("Are you sure you want to delete this book?")) return;

    const res = await fetch(`/api/delete-book/${book.id}/`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCsrfToken() },
    });

    if (res.ok) {
      alert("Book deleted!");
      window.location.href = "/catalog/books/";
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.detail || "Failed to delete book");
    }
  }

  function getCsrfToken() {
    return (
      document.cookie
        .split("; ")
        .find((r) => r.startsWith("csrftoken="))
        ?.split("=")[1] || ""
    );
  }

  async function handleEdit() {
    if (book) window.location.href = `/catalog/books/${book.id}/edit`;
  }

  return (
    <>
      <div>
        <div className="book-detail-title-div">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.23, ease: "easeInOut" }}
          >
            <div className="book-detail-title">{book?.title}</div>
            <span className="auhtor-name">
              {book?.author.first_name} {book?.author.last_name}
            </span>
          </motion.div>
        </div>
      </div>
      <div>
        <BookDetailCard book={book} />
      </div>
      <div className="delete-edit-buttons">
        {user && user.permissions.includes("catalog.delete_book") && (
          <button
            onClick={handleDelete}
            className="login-button btn btn-primary"
          >
            Delete Book
          </button>
        )}
        {user && user.permissions.includes("catalog.change_book") && (
          <button onClick={handleEdit} className="login-button btn btn-primary">
            Edit Book
          </button>
        )}
      </div>
    </>
  );
}

export default BookDetail;
