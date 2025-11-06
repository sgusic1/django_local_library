import type { Author } from "../types";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthorDetailCard from "../components/AuthorDetailCard";
import { motion } from "motion/react";
import type { User } from "../types";

function AuthorDetail() {
  const [author, setauthor] = useState<Author | null>(null);
  const { id } = useParams();
  const url = `http://127.0.0.1:8000/api/authors/${id}/`;

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

  useEffect(() => {
    const cashed = localStorage.getItem("authorDetail");
    if (cashed) {
      const parsed = JSON.parse(cashed) as Author;
      setauthor(parsed);
    }
    fetch(url)
      .then((res) => res.json())
      .then((data: Author) => {
        setauthor(data);
        localStorage.setItem("authorDetail", JSON.stringify(data || null));
      });
  }, []);

  async function handleDelete() {
    if (!author) return;
    if (!confirm("Are you sure you want to delete this author?")) return;

    const res = await fetch(`/api/delete-author/${author.id}/`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCsrfToken() },
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      alert("Author deleted!");
      window.location.href = "/catalog/authors/";
    } else {
      console.log(data.detail);
      alert(data.detail || "Failed to delete author");
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

  return (
    <>
      <div>
        <div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <AuthorDetailCard author={author} />
          </motion.div>
        </div>
      </div>
      <div>
        {user && user.permissions.includes("catalog.delete_author") && (
          <button
            onClick={handleDelete}
            className="login-button btn btn-primary"
          >
            Delete Author
          </button>
        )}
      </div>
    </>
  );
}

export default AuthorDetail;
