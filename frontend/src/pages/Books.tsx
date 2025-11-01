import { useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import type { Book, BookApiResponse } from "../types";
import Pagination from "../components/Pagination";
import { useNavigate, useLocation } from "react-router-dom";

function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);
  const [numberOfBooks, setNumberOfBooks] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = Number(
    new URLSearchParams(location.search).get("page") || 1
  );
  const url =
    currentPage > 1
      ? `http://127.0.0.1:8000/api/books/?page=${currentPage}`
      : "http://127.0.0.1:8000/api/books/";

  useEffect(() => {
    const cashed = localStorage.getItem(`bookApi_page_${currentPage}`);
    if (cashed) {
      const parsed = JSON.parse(cashed) as BookApiResponse;
      setNumberOfBooks(parsed.count);
      setNextUrl(parsed.next);
      setPreviousUrl(parsed.previous);
      setBooks(parsed.results);
      setPageSize(parsed.page_size);
    }
    fetch(url)
      .then((res) => res.json())
      .then((data: BookApiResponse) => {
        setNumberOfBooks(data.count);
        setNextUrl(data.next);
        setPreviousUrl(data.previous);
        setBooks(data.results);
        setPageSize(data.page_size);
        localStorage.setItem(
          `bookApi_page_${currentPage}`,
          JSON.stringify(data || [])
        );
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [url]);

  const handleSetUrl = (newUrl: string) => {
    const page = new URL(newUrl).searchParams.get("page") || 1;
    navigate(`?page=${page}`);
  };

  return (
    <>
      <div className="container mt-4">
        <div className="row row-cols-5 g-4">
          {books.map((book) => (
            <div key={book.id} className="col">
              <a href={`/catalog/books/${book.id}`}>
                <BookCard book={book} />
              </a>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Pagination
          count={numberOfBooks}
          nextUrl={nextUrl}
          previousUrl={previousUrl}
          page_size={pageSize}
          url={url}
          setUrl={handleSetUrl}
        />
      </div>
    </>
  );
}

export default Books;
