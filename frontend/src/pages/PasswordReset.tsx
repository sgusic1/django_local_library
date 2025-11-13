import { useState } from "react";
import { useNavigate } from "react-router-dom";

function PasswordReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    console.log("Submitting password reset form…");

    const csrftoken = document.cookie
      .split("; ")
      .find((r) => r.startsWith("csrftoken="))
      ?.split("=")[1];

    try {
      const res = await fetch("http://127.0.0.1:8000/api/password_reset/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": csrftoken || "",
        },
        body: new URLSearchParams({ email }),
      });

      if (res.ok) {
        navigate("/password-reset-done", {
          state: {
            message:
              "If your email exists, you’ll receive a reset link shortly.",
          },
        });
      } else {
        setMessage("Error sending reset link.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setMessage("Network error");
    }
  }

  return (
    <div className="container mt-5 my-form">
      <div className="my-reset-title">Password reset</div>
      <form onSubmit={handleSubmit} className="w-50 my-form">
        <label className="form-label" style={{ marginBottom: "30px" }}>
          Email address
        </label>
        <input
          type="email"
          className="form-control mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="login-button btn btn-primary">
          Send reset email
        </button>
      </form>
      {message && <p className="mt-3 text-info">{message}</p>}
    </div>
  );
}

export default PasswordReset;
