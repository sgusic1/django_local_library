import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import { useEffect, useState } from "react";

function Layout() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/loggeduser/")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top my-navbar">
        <Navigation data={data} />
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
