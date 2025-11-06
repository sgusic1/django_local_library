import type { Book } from "../types";
import { Link } from "react-router-dom";

interface bookProp {
  book: Book;
}

function AuthorBook({ book }: bookProp) {
  return (
    <div className="authorbook-card">
      <Link
        to={`/books/${book.id}/`}
        prefetch="none"
        className="authorbook-link-overlay"
      ></Link>

      <div className="authorbook-info">
        <div>
          <span className="authorbook-label">Title: </span>
          {book.title}
        </div>
        <div>
          <span className="authorbook-label">Genre: </span>
          {book.genre.map((genre, i) => (
            <span key={genre.id}>
              {genre.name}
              {i < book.genre.length - 1 && ", "}
            </span>
          ))}
        </div>
        <div>
          <span className="authorbook-label">Language: </span>
          {book.language.name}
        </div>
      </div>

      <img
        className="authorbook-image"
        src={book.cover_image || "/placeholder.png"}
        alt={book.title}
      />
    </div>
  );
}

export default AuthorBook;
