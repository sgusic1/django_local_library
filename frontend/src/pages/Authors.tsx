import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import AuthorCard from "../components/AuthorCard";
import Pagination from "../components/Pagination";
import type { Author, AuthorApiResponse } from "../types";
import { Link } from "react-router-dom";

function Authors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);
  const [numberOfAuthors, setNumberOfAuthors] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = Number(
    new URLSearchParams(location.search).get("page") || 1
  );
  const url =
    currentPage > 1
      ? `http://127.0.0.1:8000/api/authors/?page=${currentPage}`
      : "http://127.0.0.1:8000/api/authors/";

  useEffect(() => {
    let ignore = false;
    const cacheKey = `authorApi_page_${currentPage}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached) as AuthorApiResponse;
      setNumberOfAuthors(parsed.count);
      setNextUrl(parsed.next);
      setPreviousUrl(parsed.previous);
      setAuthors(parsed.results);
      setPageSize(parsed.page_size);
    }

    fetch(url)
      .then((res) => res.json())
      .then((data: AuthorApiResponse) => {
        if (!ignore) {
          setNumberOfAuthors(data.count);
          setNextUrl(data.next);
          setPreviousUrl(data.previous);
          setAuthors(data.results);
          setPageSize(data.page_size);
          localStorage.setItem(cacheKey, JSON.stringify(data));
        }
      })
      .catch((err) => {
        if (!ignore) console.error("Fetch error:", err);
      });

    return () => {
      ignore = true;
    };
  }, [url, currentPage]);

  const handleSetUrl = (newUrl: string) => {
    const page = new URL(newUrl).searchParams.get("page") || 1;
    navigate(`?page=${page}`);
  };

  return (
    <motion.div
      key={currentPage}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.23, ease: "easeOut" }}
    >
      <div className="title-p">
        <div className="my-author-title my-title">Authors</div>
      </div>

      <div className="container mt-4">
        <div className="row row-cols-4 g-4">
          {authors.map((author) => (
            <div key={author.id} className="col">
              <Link
                to={`/authors/${author.id}/`}
                prefetch="none"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <AuthorCard author={author} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <Pagination
        count={numberOfAuthors}
        nextUrl={nextUrl}
        previousUrl={previousUrl}
        page_size={pageSize}
        url={url}
        setUrl={handleSetUrl}
      />
    </motion.div>
  );
}

export default Authors;
