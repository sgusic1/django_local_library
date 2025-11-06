import type { Author } from "../types";

interface Props {
  author: Author;
}

function BookCard({ author }: Props) {
  return (
    <div className="my-book-card my-author-card">
      <h5 className="my-book-title">
        {author.first_name} {author.last_name}
      </h5>
    </div>
  );
}

export default BookCard;
