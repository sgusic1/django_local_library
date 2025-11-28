import type { Book } from "../types";
import React, { useState } from "react";

interface Props {
  book: Book;
  hideImage?: boolean;
}

function BookCard({ book, hideImage = false }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="my-book-card">
      {!hideImage && (
        <img
          src={book.cover_image || "/placeholder.png"}
          alt={book.title}
          className={`my-book-cover ${loaded ? "loaded" : ""}`}
          onLoad={() => setLoaded(true)}
        />
      )}

      {hideImage && <div className="my-book-cover placeholder" />}

      <h5 className="my-book-title">{book.title}</h5>
    </div>
  );
}

export default React.memo(BookCard);
