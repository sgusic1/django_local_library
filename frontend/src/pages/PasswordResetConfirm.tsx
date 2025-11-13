import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

function PasswordResetConfirm() {
  const { uid, token } = useParams();

  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/password_reset/confirm/${uid}/${token}/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            new_password1: newPassword,
            new_password2: confirmPassword,
          }),
        }
      );

      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const data = await res.json();
        const errors = Object.values(data).flat();
        setMessage(errors.join(" "));
      }
    } catch {
      setMessage("Network error.");
    }
  }

  return (
    <div className="container mt-5 my-form">
      <div className="my-login">Set new password</div>
      <form onSubmit={handleSubmit} className="w-50 my-form">
        <label className="form-label" style={{ marginBottom: "20px" }}>
          New password
        </label>
        <input
          type="password"
          className="form-control mb-3"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <label className="form-label" style={{ marginBottom: "20px" }}>
          Confirm password
        </label>
        <input
          type="password"
          className="form-control mb-3"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-button btn btn-primary">
          Reset password
        </button>
      </form>

      {message && (
        <div
          className={`alert mt-3 ${
            message.startsWith("Password reset successful")
              ? "alert-success"
              : "alert-danger"
          }`}
          role="alert"
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default PasswordResetConfirm;
