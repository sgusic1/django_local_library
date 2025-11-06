import { useState } from "react";

function Registration() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/register/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        body: JSON.stringify({ email, username, password }),
      });
      if (res.ok) {
        await new Promise((r) => setTimeout(r, 100));
        setUsername("");
        setEmail("");
        setPassword("");
        window.location.href = "/catalog/";
      } else {
        const data = await res.json().catch(() => ({}));
        if (data && typeof data === "object") {
          setFieldErrors(data);
        } else {
          setError("Failed to create book");
        }
      }
    } catch (err) {
      setError("Registration failed");
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
      <div className="my-registration-title ">Registration</div>
      <form onSubmit={handleSubmit} className="w-50">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {fieldErrors.email && (
            <div className="text-danger small">
              {fieldErrors.email.join(", ")}
            </div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {fieldErrors.username && (
            <div className="text-danger small">
              {fieldErrors.username.join(", ")}
            </div>
          )}
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
          {fieldErrors.password && (
            <div className="text-danger small">
              {fieldErrors.password.join(", ")}
            </div>
          )}
        </div>
        <button type="submit" className="login-button btn btn-primary">
          Create account
        </button>
      </form>
    </div>
  );
}

export default Registration;
