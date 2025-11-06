import { useState, useEffect } from "react";
import { motion } from "motion/react";
import IndexCard from "../components/IndexCard";

function Index() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;

    const cached = localStorage.getItem("indexData");
    if (cached) {
      setData(JSON.parse(cached));
    }

    fetch("http://127.0.0.1:8000/api/index")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) {
          setData(data);
          localStorage.setItem("indexData", JSON.stringify(data));
        }
      })
      .catch((err) => console.error("Error fetching data:", err));

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <motion.div
      key="index-page"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.23, ease: "easeOut" }}
    >
      <div className="title-p">
        <div className="my-title">Welcome to LocalLibrary</div>
        <p>A modern place to explore authors, books and more.</p>
      </div>
      <IndexCard data={data} />
    </motion.div>
  );
}

export default Index;
