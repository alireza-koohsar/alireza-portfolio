
import { useEffect, useState } from "react";

const emptyProject = {
  title: "",
  slug: "",
  category: "",
  year: new Date().getFullYear(),
  client: "",
  description: "",
  role: "",
  cover: "",
  hero: "",
  video: "",
  tools: [],
  gallery: [],
  services: [],
  software: [],
  tags: [],
  case_study: {
    challenge: "",
    solution: "",
    result: "",
  },
  featured: false,
  published: false,
  sort_order: 0,
};

const fields = [
  ["title", "Project Title"],
  ["slug", "Project Slug"],
  ["category", "Category"],
  ["year", "Year"],
  ["client", "Client"],
  ["role", "My Role"],
  ["cover", "Cover Image URL"],
  ["hero", "Hero Image URL"],
  ["video", "Video URL"],
];

const listFields = [
  ["tools", "Tools (one per line)"],
  ["services", "Services (one per line)"],
  ["software", "Software (one per line)"],
  ["tags", "Tags (one per line)"],
  ["gallery", "Gallery Image URLs (one per line)"],
];

function createEmptyProject() {
  return {
    ...emptyProject,
    tools: [],
    gallery: [],
    services: [],
    software: [],
    tags: [],
    case_study: {
      challenge: "",
      solution: "",
      result: "",
    },
  };
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

function toFormProject(project) {
  let caseStudy = project.case_study;

  if (typeof caseStudy === "string") {
    try {
      caseStudy = JSON.parse(caseStudy);
    } catch {
      caseStudy = {};
    }
  }

  if (!caseStudy || typeof caseStudy !== "object" || Array.isArray(caseStudy)) {
    caseStudy = {};
  }

  return {
    ...createEmptyProject(),
    ...project,
    tools: Array.isArray(project.tools) ? project.tools : [],
    gallery: Array.isArray(project.gallery) ? project.gallery : [],
    services: Array.isArray(project.services) ? project.services : [],
    software: Array.isArray(project.software) ? project.software : [],
    tags: Array.isArray(project.tags) ? project.tags : [],
    case_study: {
      ...caseStudy,
      challenge: caseStudy.challenge ?? "",
      solution: caseStudy.solution ?? "",
      result: caseStudy.result ?? "",
    },
    featured: Boolean(project.featured),
    published: Boolean(project.published),
  };
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(createEmptyProject);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadProjects() {
    const data = await api("/api/admin/projects");
    setProjects(data);
  }

  useEffect(() => {
    api("/api/admin/session")
      .then(async (data) => {
        setAuthenticated(data.authenticated);

        if (data.authenticated) {
          await loadProjects();
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setChecking(false));
  }, []);

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      setPassword("");
      setAuthenticated(true);
      await loadProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      await api("/api/admin/logout", { method: "POST" });
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthenticated(false);
      setProjects([]);
      setEditingId(null);
      setProject(createEmptyProject());
      setPassword("");
    }
  }

  function startNew() {
    setEditingId(null);
    setProject(createEmptyProject());
    setError("");
    setNotice("");
  }

  function editProject(item) {
    setEditingId(item.id);
    setProject(toFormProject(item));
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateField(name, value) {
    setProject((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function saveProject(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const payload = { ...project };

    for (const [name] of listFields) {
      if (typeof payload[name] === "string") {
        payload[name] = payload[name]
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    payload.year = payload.year === "" ? null : Number(payload.year);
    payload.sort_order = Number(payload.sort_order || 0);

    try {
      if (editingId) {
        await api(
          `/api/admin/projects/${encodeURIComponent(editingId)}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        setNotice("Project updated successfully.");
      } else {
        await api("/api/admin/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setNotice("Project created successfully.");
      }

      await loadProjects();
      setEditingId(null);
      setProject(createEmptyProject());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteProject(item) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${item.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api(
        `/api/admin/projects/${encodeURIComponent(item.id)}`,
        { method: "DELETE" }
      );

      if (editingId === item.id) {
        startNew();
      }

      await loadProjects();
      setNotice("Project deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (checking) {
    return <main className="admin-shell">Checking session...</main>;
  }

  if (!authenticated) {
    return (
      <main className="admin-shell" dir="ltr">
        <form className="admin-login" onSubmit={login}>
          <p className="admin-eyebrow">ALIREZA KOOHSAR / ADMIN</p>
          <h1>Admin Login</h1>

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="admin-error">{error}</p>}

          <button disabled={busy}>
            {busy ? "Logging in..." : "Log In"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell" dir="ltr">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">ALIREZA KOOHSAR / ADMIN</p>
          <h1>Project Management</h1>
          <p>Total Projects: {projects.length}</p>
        </div>

        <button
          type="button"
          className="admin-secondary"
          onClick={logout}
        >
          Log Out
        </button>
      </header>

      {error && <p className="admin-error">{error}</p>}
      {notice && <p className="admin-notice">{notice}</p>}

      <section className="admin-panel">
        <div className="admin-section-heading">
          <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>

          {editingId && (
            <button
              type="button"
              className="admin-secondary"
              onClick={startNew}
            >
              Cancel Editing
            </button>
          )}
        </div>

        <form onSubmit={saveProject}>
          <div className="admin-grid">
            {fields.map(([name, label]) => (
              <label className="admin-field" key={name}>
                <span>{label}</span>
                <input
                  required={name === "title" || name === "slug"}
                  type={name === "year" ? "number" : "text"}
                  value={project[name] ?? ""}
                  onChange={(event) =>
                    updateField(name, event.target.value)
                  }
                />
              </label>
            ))}

            <label className="admin-field admin-full">
              <span>Project Description</span>
              <textarea
                rows={5}
                value={project.description ?? ""}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Describe the project..."
              />
            </label>

            {listFields.map(([name, label]) => (
              <label className="admin-field" key={name}>
                <span>{label}</span>
                <textarea
                  rows={4}
                  value={
                    Array.isArray(project[name])
                      ? project[name].join("\n")
                      : project[name] ?? ""
                  }
                  onChange={(event) =>
                    updateField(name, event.target.value)
                  }
                  placeholder="Enter one item per line"
                />
              </label>
            ))}

            <label className="admin-field">
              <span>Display Order</span>
              <input
                type="number"
                value={project.sort_order ?? 0}
                onChange={(event) =>
                  updateField("sort_order", event.target.value)
                }
              />
            </label>

            <label className="admin-field admin-full">
              <span>The Challenge</span>
              <textarea
                rows={4}
                value={project.case_study?.challenge ?? ""}
                onChange={(event) =>
                  updateField("case_study", {
                    ...project.case_study,
                    challenge: event.target.value,
                  })
                }
                placeholder="Describe the main challenge..."
              />
            </label>

            <label className="admin-field admin-full">
              <span>The Solution</span>
              <textarea
                rows={4}
                value={project.case_study?.solution ?? ""}
                onChange={(event) =>
                  updateField("case_study", {
                    ...project.case_study,
                    solution: event.target.value,
                  })
                }
                placeholder="Describe your approach and solution..."
              />
            </label>

            <label className="admin-field admin-full">
              <span>The Result</span>
              <textarea
                rows={4}
                value={project.case_study?.result ?? ""}
                onChange={(event) =>
                  updateField("case_study", {
                    ...project.case_study,
                    result: event.target.value,
                  })
                }
                placeholder="Describe the outcome and impact..."
              />
            </label>
          </div>

          <div className="admin-options">
            <label>
              <input
                type="checkbox"
                checked={project.featured}
                onChange={(event) =>
                  updateField("featured", event.target.checked)
                }
              />
              Featured Project
            </label>

            <label>
              <input
                type="checkbox"
                checked={project.published}
                onChange={(event) =>
                  updateField("published", event.target.checked)
                }
              />
              Published
            </label>
          </div>

          <div className="admin-actions">
            <button disabled={busy}>
              {busy ? "Saving..." : "Save Project"}
            </button>

            <button
              type="button"
              className="admin-secondary"
              onClick={startNew}
            >
              Clear Form
            </button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <h2>All Projects</h2>

        {projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <div className="admin-project-list">
            {projects.map((item) => (
              <article className="admin-project" key={item.id}>
                <div>
                  <h3>{item.title}</h3>

                  <p>
                    {item.category || "Uncategorized"} · {item.slug}
                  </p>

                  <span
                    className={
                      item.published
                        ? "admin-status is-published"
                        : "admin-status"
                    }
                  >
                    {item.published ? "Published" : "Draft"}
                  </span>

                  {item.featured && (
                    <span className="admin-status">
                      Featured Project
                    </span>
                  )}
                </div>

                <div className="admin-actions">
                  <button
                    type="button"
                    onClick={() => editProject(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="admin-danger"
                    onClick={() => deleteProject(item)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}