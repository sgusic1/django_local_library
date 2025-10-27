import { useState, useEffect } from "react";
import IndexCard from "../components/IndexCard";

function Index() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const cashed = localStorage.getItem("indexData");
    if (cashed) {
      setData(JSON.parse(cashed));
    }
    fetch("http://127.0.0.1:8000/api/index")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        localStorage.setItem("indexData", JSON.stringify(data));
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <>
      <div className="title-p">
        <div className="my-title">Welcome to LocalLibrary</div>
        <p>A modern place to explore authors, books and more.</p>
      </div>
      <IndexCard data={data} />
    </>
  );
}

export default Index;
