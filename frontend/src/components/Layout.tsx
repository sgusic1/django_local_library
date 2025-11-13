import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import { useEffect, useState } from "react";
import type { User } from "../types";

function Layout() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem("currentUser");
    return cached ? JSON.parse(cached) : null;
  });
  useEffect(() => {
    const cached = localStorage.getItem("currentUser");
    if (cached) setCurrentUser(JSON.parse(cached));

    async function loadUser() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/currentuser/", {
          credentials: "include",
        });
        if (res.status === 401) {
          setCurrentUser(null);
          localStorage.removeItem("currentUser");
          return;
        }

        const data: User = await res.json();
        setCurrentUser(data);
        localStorage.setItem("currentUser", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }

    loadUser();
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top my-navbar">
        <Navigation user={currentUser} />
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
