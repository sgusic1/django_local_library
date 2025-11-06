import { useState } from "react";

function CreateAuthor() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function getCookie(name: string) {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
  }

  const csrftoken = getCookie("csrftoken") || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("date_of_birth", birthDate);
      formData.append("date_of_death", deathDate);

      const res = await fetch("/api/create-author/", {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": csrftoken },
        body: formData,
      });
      if (res.ok) {
        await new Promise((r) => setTimeout(r, 100));
        const data = await res.json().catch(() => ({}));
        window.location.href = `/catalog/authors/${data.id}`;
      } else {
        const data = await res.json().catch(() => {});
        if (data && typeof data === "object") {
          setFieldErrors(data);
        } else {
          setError("Failed to create author.");
        }
      }
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <div className="container mt-5 my-form">
      <div className="my-create-book-title">Create author</div>
      <form onSubmit={handleSubmit} className="w-50 my-create-book-form">
        {error && <div className="alert alert-danger">{error}</div>}
        {fieldErrors.detail && (
          <div className="alert alert-danger">
            {fieldErrors.detail.join?.(", ") || fieldErrors.detail}
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">First name</label>
          <input
            className="form-control purple-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          {fieldErrors.first_name && (
            <div className="text-danger small">
              {fieldErrors.first_name.join(", ")}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Last name</label>
          <input
            className="form-control purple-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          {fieldErrors.last_name && (
            <div className="text-danger small">
              {fieldErrors.last_name.join(", ")}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Date of birth</label>
          <input
            type="date"
            className="form-control purple-input"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
          {fieldErrors.date_of_birth && (
            <div className="text-danger small">
              {fieldErrors.date_of_birth.join(", ")}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Date of death</label>
          <input
            type="date"
            className="form-control purple-input"
            value={deathDate}
            onChange={(e) => setDeathDate(e.target.value)}
            required
          />
          {fieldErrors.date_of_death && (
            <div className="text-danger small">
              {fieldErrors.date_of_death.join(", ")}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary login-button purple-button"
        >
          Create author
        </button>
      </form>
    </div>
  );
}

export default CreateAuthor;
