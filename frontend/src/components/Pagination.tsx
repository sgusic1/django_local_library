type PaginationProp = {
  count: number | null;
  nextUrl: string | null;
  previousUrl: string | null;
  url: string;
  setUrl: (newUrl: string) => void;
  page_size: number | null;
};

function Pagination({
  count,
  nextUrl,
  previousUrl,
  url,
  setUrl,
  page_size,
}: PaginationProp) {
  const currentPage = Number(new URL(url).searchParams.get("page") || 1);
  return (
    <>
      <div>
        <button
          type="button"
          disabled={!previousUrl}
          onClick={() => previousUrl && setUrl(previousUrl)}
          className="pagination-button btn btn-primary"
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <span className="pagination-text">
          {currentPage} of {count && page_size && Math.ceil(count / page_size)}
        </span>
        <button
          disabled={!nextUrl}
          onClick={() => {
            nextUrl && setUrl(nextUrl);
          }}
          className="pagination-button btn btn-primary"
        >
          <i className="bi bi-arrow-right"></i>
        </button>
      </div>
    </>
  );
}

export default Pagination;
