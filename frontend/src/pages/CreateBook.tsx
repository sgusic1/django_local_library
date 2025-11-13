import { useState, useEffect } from "react";
import type { Author, Genre, Language, AuthorApiResponse } from "../types";

function CreateBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [summary, setSummary] = useState("");
  const [isbn, setISBN] = useState("");
  const [genres, setGenres] = useState<number[]>([]);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [language, setLanguage] = useState("");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [cover, setCover] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/authors/")
      .then((res) => res.json())
      .then((data: AuthorApiResponse) => setAuthors(data.results ?? data));
    fetch("http://127.0.0.1:8000/api/genres/")
      .then((res) => res.json())
      .then((data: Genre[]) => setAvailableGenres(data));
    fetch("http://127.0.0.1:8000/api/languages/")
      .then((res) => res.json())
      .then((data: Language[]) => setLanguages(data));
  }, []);

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
      formData.append("title", title);
      formData.append("author", author);
      formData.append("summary", summary);
      formData.append("isbn", isbn);
      formData.append("language", language);
      formData.append("cover_image", cover!);

      genres.forEach((g) => formData.append("genre", String(g)));
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }
      const res = await fetch("http://127.0.0.1:8000/api/create-book/", {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": csrftoken },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        await new Promise((r) => setTimeout(r, 100));
        window.location.href = `/catalog/books/${data.id}`;
      } else {
        const data = await res.json().catch(() => {});
        if (data && typeof data === "object") {
          setFieldErrors(data);
        } else {
          setError("Failed to create book");
        }
      }
    } catch (err) {
      setError("Network error");
    }
  }

  function handleGenreChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = Array.from(e.target.selectedOptions, (opt) =>
      Number(opt.value)
    );
    setGenres(selected);
  }

  return (
    <div className="container mt-5 my-form">
      <div className="my-create-book-title">Create book</div>
      <form onSubmit={handleSubmit} className="w-50 my-create-book-form">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            className="form-control purple-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {fieldErrors.title && (
            <div className="text-danger small">
              {fieldErrors.title.join(", ")}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Author</label>
          <select
            className="form-select purple-select"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          >
            <option value="">Select an author</option>
            {Array.isArray(authors) &&
              authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.first_name} {a.last_name}
                </option>
              ))}
          </select>
          {fieldErrors.author && (
            <div className="text-danger small">
              {fieldErrors.author.join(", ")}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Summary</label>
          <textarea
            className="form-control purple-input"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            rows={4}
          />
          {fieldErrors.summary && (
            <div className="text-danger small">
              {fieldErrors.summary.join(", ")}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">ISBN</label>
          <input
            className="form-control purple-input"
            value={isbn}
            onChange={(e) => setISBN(e.target.value)}
            required
          />
          {fieldErrors.isbn && (
            <div className="text-danger small">
              {fieldErrors.isbn.join(", ")}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Genre</label>
          <select
            multiple
            className="form-select purple-select"
            value={genres.map(String)}
            onChange={handleGenreChange}
            required
          >
            {availableGenres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {fieldErrors.genre && (
            <div className="text-danger small">
              {fieldErrors.genre.join(", ")}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Language</label>
          <select
            className="form-select purple-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
          >
            <option value="">Select a language</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {fieldErrors.language && (
            <div className="text-danger small">
              {fieldErrors.language.join(", ")}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Book cover</label>
          <input
            type="file"
            className="form-control purple-input"
            accept="image/*"
            onChange={(e) => {
              if (!e.target.files?.length) return;
              setCover(e.target.files[0]);
            }}
          />
          {fieldErrors.cover_image && (
            <div className="text-danger small">
              {fieldErrors.cover_image.join(", ")}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary login-button purple-button"
        >
          Create book
        </button>
      </form>
    </div>
  );
}

export default CreateBook;
