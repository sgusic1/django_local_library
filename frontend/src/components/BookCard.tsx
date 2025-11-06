import type { Book } from "../types";

interface Props {
  book: Book;
}

function BookCard({ book }: Props) {
  return (
    <div className="my-book-card">
      <img
        src={book.cover_image || "/placeholder.png"}
        alt={book.title}
        className="my-book-cover"
      />
      <h5 className="my-book-title">{book.title}</h5>
    </div>
  );
}

export default BookCard;
