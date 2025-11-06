import { useLocation, Link } from "react-router-dom";

function PasswordResetDone() {
  const location = useLocation();
  const message =
    (location.state as { message?: string })?.message ||
    "If your account exists, you’ll receive an email soon.";

  return (
    <div className="container mt-5 text-center">
      <div className="my-login">Password Reset</div>
      <p>{message}</p>
      <Link to="/login/" className="btn login-button btn-primary mt-3">
        Back to login
      </Link>
    </div>
  );
}

export default PasswordResetDone;
