import type { Book } from "../types";
import Copies from "./Copies";
import { motion } from "motion/react";

interface Props {
  book: Book | null;
}

function BookDetailCard({ book }: Props) {
  return (
    <>
      <motion.div
        className="book-card-detail-outer"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.23, ease: "easeInOut" }}
      >
        <div className="book-card-detail">
          <div>
            <span className="book-detail">Summary: </span>
            {book?.summary}
          </div>
          <div className="book-card-margin">
            <span className="book-detail">ISBN: </span>
            {book?.isbn}
          </div>
          <div className="book-card-margin">
            <span className="book-detail">Language: </span>
            {book?.language.name}
          </div>
          <div className="book-card-margin">
            <span className="book-detail">Genre: </span>
            {book?.genre.map((genre, i) => {
              return (
                <span key={genre.id}>
                  {genre.name}
                  {i < book.genre.length - 1 && ", "}
                </span>
              );
            })}
          </div>
          <motion.img
            className="book-cover"
            style={{
              position: "absolute",
              top: "-150px",
              right: "0",
            }}
            src={book?.cover_image || "/placeholder.png"}
            alt={book?.title}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </div>
        <div className="copies-div">
          <div>
            <span className="book-copies">Copies</span>
          </div>
          <div className="container-fluid mt-4">
            <div className="row row-cols-2 g-1">
              {book?.instances?.length ? (
                book.instances.map((instance) => (
                  <div className="col" key={instance.id}>
                    <Copies instance={instance} />
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

export default BookDetailCard;
