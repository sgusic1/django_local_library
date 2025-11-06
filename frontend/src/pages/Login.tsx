import { useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/accounts/login/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username,
          password,
          csrfmiddlewaretoken: getCookie("csrftoken"),
        }),
      });
      if (res.ok) {
        await new Promise((r) => setTimeout(r, 100));
        window.location.href = "/catalog/";
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Network error");
    }
  }

  function getCookie(name: string) {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : "";
  }

  return (
    <div className="container mt-5 my-form">
      <div className="my-login-title ">Login</div>
      <form onSubmit={handleSubmit} className="w-50">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <a
          href="/catalog/password-reset/"
          style={{
            textAlign: "right",
            marginTop: "40px",
            marginBottom: "-20px",
            display: "block",
          }}
        >
          Forgot password?
        </a>
        <button type="submit" className="login-button btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
