interface Props {
  data: {
    num_books: number;
    num_authors: number;
    num_instances: number;
    num_instances_available: number;
    num_visits: number;
  } | null;
}

function IndexCard({ data }: Props) {
  if (!data)
    return (
      <>
        <div className="card my-card">
          <div className="card-body">
            <h5 className="card-title my-card-text">
              Can't fetch data... <br />
              :(
            </h5>
          </div>
        </div>
      </>
    );
  return (
    <>
      <div className="card my-card outer-card">
        <div className="card-body my-card-text inner-card">
          <h3 className="card-title">Library Stats</h3>
          <p>Books: {data.num_books}</p>
          <p>Authors: {data.num_authors}</p>
          <p>Copies: {data.num_instances}</p>
          <p>Available Copies: {data.num_instances_available}</p>
          {data.num_visits !== 0 && (
            <p style={{ textAlign: "left" }}>
              You have visited this page: {data.num_visits}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default IndexCard;
