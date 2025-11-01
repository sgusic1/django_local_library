interface Props {
  data: {
    is_user_authenticated: boolean;
    username: string;
  } | null;
}

function Navigation({ data }: Props) {
  return (
    <div className="container d-flex align-items-center">
      <a
        className="navbar-brand d-flex align-items-center my-logo-text"
        href="/catalog/"
      >
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Logo"
          width="80"
          height="66"
          className="my-logo-image"
        />
        <span>LocalLibrary</span>
      </a>
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
        className="collapse navbar-collapse align-items-center"
        id="navbarNavDropdown"
      >
        <ul className="navbar-nav w-100 justify-content-evenly align-items-center ms-5">
          <li className="nav-item">
            <a className="nav-link" aria-current="page" href="/catalog/">
              Home
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/catalog/books/">
              Books
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/catalog/authors/">
              Authors
            </a>
          </li>
          <li className="nav-item ms-auto">
            <a
              className="nav-link my-user-image "
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src={`${import.meta.env.BASE_URL}user.png`}
                alt="Logo"
                width="120"
                height="77"
                className="my-user-image"
              />
              {data && data.is_user_authenticated && <p>{data.username}!</p>}
            </a>
            <ul className="dropdown-menu my-dropdown-menu dropdown-menu-end">
              <li className="log-button">
                <a className="dropdown-item log-button" href="#">
                  {data?.is_user_authenticated ? "Log out" : "Login"}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navigation;
