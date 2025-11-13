import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import BookCard from "../components/BookCard";
import Pagination from "../components/Pagination";
import type { Book, BookApiResponse } from "../types";

function MyBorrowed() {
  const [books, setBooks] = useState<Book[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);
  const [numberOfBooks, setNumberOfBooks] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = useMemo(
    () => Number(new URLSearchParams(location.search).get("page") || 1),
    [location.search]
  );

  const url = useMemo(
    () =>
      currentPage > 1
        ? `http://127.0.0.1:8000/api/my-borrowed/?page=${currentPage}`
        : "http://127.0.0.1:8000/api/my-borrowed/",
    [currentPage]
  );

  useEffect(() => {
    let ignore = false;

    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    }

    const fetchBooks = async () => {
      const cacheKey = `bookApi_page_${currentPage}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached) as BookApiResponse;
        setNumberOfBooks(parsed.count);
        setNextUrl(parsed.next);
        setPreviousUrl(parsed.previous);
        setBooks(parsed.results);
        setPageSize(parsed.page_size);
      }

      try {
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
        });

        const data: BookApiResponse = await res.json();
        if (!ignore) {
          setNumberOfBooks(data.count);
          setNextUrl(data.next);
          setPreviousUrl(data.previous);
          setBooks(data.results);
          setPageSize(data.page_size);
          localStorage.setItem(cacheKey, JSON.stringify(data));
        }
      } catch (err) {
        if (!ignore) console.error("Fetch error:", err);
      }
    };

    fetchBooks();
    return () => {
      ignore = true;
    };
  }, [url, currentPage]);

  const handleSetUrl = (newUrl: string) => {
    const page = new URL(newUrl).searchParams.get("page") || 1;
    navigate(`?page=${page}`);
  };

  return (
    <>
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.23, ease: "easeInOut" }}
      >
        <div className="my-login">My borrowed</div>
        <div className="container mt-4">
          {books.length === 0 ? (
            <div className="text-center mt-5 text-muted fs-5">
              You have no borrowed books.
            </div>
          ) : (
            <div className="row row-cols-5 g-4">
              {books.map((book) => (
                <div key={book.id} className="col">
                  <Link to={`/books/${book.id}/`} prefetch="none">
                    <BookCard book={book} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {books.length > 15 && (
          <Pagination
            count={numberOfBooks}
            nextUrl={nextUrl}
            previousUrl={previousUrl}
            page_size={pageSize}
            url={url}
            setUrl={handleSetUrl}
          />
        )}
      </motion.div>
    </>
  );
}

export default MyBorrowed;
