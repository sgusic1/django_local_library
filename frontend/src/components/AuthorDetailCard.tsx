import type { Author } from "../types";
import AuthorBook from "./AuthorBook";
import { motion } from "motion/react";

interface Props {
  author: Author | null;
}

function AuthorDetailCard({ author }: Props) {
  return (
    <>
      <motion.div
        className="book-card-detail-outer"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="book-card-detail">
          <div className="book-card-margin">
            <span className="book-detail">First name: </span>
            {author?.first_name}
          </div>
          <div className="book-card-margin">
            <span className="book-detail">Last name: </span>
            {author?.last_name}
          </div>
          <div className="book-card-margin">
            <span className="book-detail">Date of birth: </span>
            {author?.date_of_birth
              ? new Date(author.date_of_birth).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </div>
          <div className="book-card-margin">
            <span className="book-detail">Date of death: </span>
            {author?.date_of_death
              ? new Date(author.date_of_death).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </div>
        </div>
        <div className="copies-div">
          <div>
            <span className="book-copies">Books</span>
          </div>
          <div className="container-fluid mt-4">
            <div className="row row-cols-2 g-1">
              {author?.books?.length ? (
                author.books.map((book) => (
                  <div className="col" key={book.id}>
                    <AuthorBook book={book} />
                  </div>
                ))
              ) : (
                <div>This book has no available copies...</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default AuthorDetailCard;
