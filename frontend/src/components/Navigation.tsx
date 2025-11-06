import { Link } from "react-router-dom";
import type { User } from "../types";
import { useRef } from "react";

interface userProp {
  user: User | null;
}

function Navigation({ user }: userProp) {
  const logoutFormRef = useRef<HTMLFormElement>(null);

  function handleLogout(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    logoutFormRef.current?.submit();
  }

  return (
    <div className="container d-flex align-items-center">
      <Link
        className="navbar-brand d-flex align-items-center my-logo-text"
        to="/"
      >
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Logo"
          width="80"
          height="66"
          className="my-logo-image"
        />
        <span>LocalLibrary</span>
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNavDropdown"
        aria-controls="navbarNavDropdown"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div
        className="collapse navbar-collapse align-items-center justify-content-between"
        id="navbarNavDropdown"
        style={{ marginLeft: "-3.5rem" }}
      >
        <ul className="navbar-nav mx-auto d-flex justify-content-center align-items-center gap-4">
          <li className="nav-item">
            <Link className="nav-link" to="/">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/books">
              Books
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/authors">
              Authors
            </Link>
          </li>
          {user && (
            <li className="nav-item">
              <Link className="nav-link" to="/my-borrowed">
                My borrowed
              </Link>
            </li>
          )}
          {user && user.permissions.includes("catalog.add_book") && (
            <li className="nav-item">
              <Link className="nav-link" to="/create-book">
                Add book
              </Link>
            </li>
          )}
          {user && user.permissions.includes("catalog.add_author") && (
            <li className="nav-item">
              <Link className="nav-link" to="/create-author">
                Add author
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className="my-user-dropdown">
        <div
          className="d-flex align-items-center my-user-image"
          role="button"
          style={{
            gap: "1rem",
            color: "white",
            font: "Poppins",
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}user.png`}
            alt="User"
            width="120"
            height="77"
            className="my-user-image"
            style={{ width: "120px", height: "77px", objectFit: "cover" }}
          />
          {user && (
            <span
              className="fw-medium"
              style={{ whiteSpace: "nowrap", fontSize: "1rem" }}
            >
              {user.username}
            </span>
          )}
        </div>

        <ul className="dropdown-menu my-dropdown-menu dropdown-menu-end">
          <li className="log-button">
            {user ? (
              <>
                <form
                  ref={logoutFormRef}
                  method="POST"
                  action="/accounts/logout/"
                  style={{ display: "none" }}
                >
                  <input
                    type="hidden"
                    name="csrfmiddlewaretoken"
                    value={
                      document.cookie
                        .split("; ")
                        .find((r) => r.startsWith("csrftoken="))
                        ?.split("=")[1] || ""
                    }
                  />
                </form>

                <a
                  className="dropdown-item log-button"
                  href="#"
                  onClick={handleLogout}
                >
                  Log out
                </a>
              </>
            ) : (
              <>
                <Link className="dropdown-item log-button" to="/login/">
                  Login
                </Link>
                <Link className="dropdown-item log-button" to="/register/">
                  Register
                </Link>
              </>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navigation;
