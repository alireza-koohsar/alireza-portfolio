
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
  case_study: {},
  featured: false,
  published: false,
  sort_order: 0,
};

const fields = [
  ["title", "عنوان پروژه"],
  ["slug", "شناسه انگلیسی (مثلاً ai-technology)"],
  ["category", "دسته‌بندی"],
  ["year", "سال"],
  ["client", "مشتری"],
  ["role", "نقش شما"],
  ["cover", "آدرس تصویر کاور"],
  ["hero", "آدرس تصویر اصلی"],
  ["video", "آدرس ویدیو"],
];

const listFields = [
  ["tools", "ابزارها"],
  ["services", "خدمات (هر مورد در یک خط)"],
  ["software", "نرم‌افزارها (هر مورد در یک خط)"],
  ["tags", "برچسب‌ها (هر مورد در یک خط)"],
  ["gallery", "آدرس تصاویر گالری (هر آدرس در یک خط)"],
];

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
    throw new Error(data.error || "خطایی رخ داد.");
  }

  return data;
}

function toFormProject(project) {
  return {
    ...emptyProject,
    ...project,
    tools: Array.isArray(project.tools) ? project.tools : [],
    gallery: Array.isArray(project.gallery) ? project.gallery : [],
    services: Array.isArray(project.services) ? project.services : [],
    software: Array.isArray(project.software) ? project.software : [],
    tags: Array.isArray(project.tags) ? project.tags : [],
    case_study: project.case_study || {},
    featured: Boolean(project.featured),
    published: Boolean(project.published),
  };
}

export default function Admin() {
  const adminPage = true;
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(emptyProject);
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
        if (data.authenticated) await loadProjects();
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
    } finally {
      setAuthenticated(false);
      setProjects([]);
      setEditingId(null);
      setProject(emptyProject);
    }
  }

  function startNew() {
    setEditingId(null);
    setProject({ ...emptyProject });
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
    setProject((current) => ({ ...current, [name]: value }));
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
        await api(`/api/admin/projects/${encodeURIComponent(editingId)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setNotice("تغییرات پروژه ذخیره شد.");
      } else {
        await api("/api/admin/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("پروژه جدید ساخته شد.");
      }

      await loadProjects();
      setEditingId(null);
      setProject({ ...emptyProject });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteProject(item) {
    if (!window.confirm(`پروژه «${item.title}» برای همیشه حذف شود؟`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await api(`/api/admin/projects/${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      if (editingId === item.id) startNew();
      await loadProjects();
      setNotice("پروژه حذف شد.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (checking) {
    return <main className="admin-shell">در حال بررسی ورود...</main>;
  }

  if (!authenticated) {
    return (
      <main className="admin-shell" dir="rtl">
        <form className="admin-login" onSubmit={login}>
          <p className="admin-eyebrow">ALIREZA KOOHSAR / ADMIN</p>
          <h1>ورود به پنل مدیریت</h1>
          <label htmlFor="admin-password">رمز عبور</label>
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
            {busy ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell" dir="rtl">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">ALIREZA KOOHSAR / ADMIN</p>
          <h1>مدیریت پروژه‌ها</h1>
          <p>تعداد پروژه‌ها: {projects.length}</p>
        </div>
        <button type="button" className="admin-secondary" onClick={logout}>
          خروج
        </button>
      </header>

      {error && <p className="admin-error">{error}</p>}
      {notice && <p className="admin-notice">{notice}</p>}

      <section className="admin-panel">
        <div className="admin-section-heading">
          <h2>{editingId ? "ویرایش پروژه" : "افزودن پروژه جدید"}</h2>
          {editingId && (
            <button
              type="button"
              className="admin-secondary"
              onClick={startNew}
            >
              انصراف از ویرایش
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
                  onChange={(event) => updateField(name, event.target.value)}
                />
              </label>
            ))}

            <label className="admin-field admin-full">
              <span>توضیحات پروژه</span>
              <textarea
                rows="5"
                value={project.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
              />
            </label>

            {listFields.map(([name, label]) => (
              <label className="admin-field" key={name}>
                <span>{label}</span>
                <textarea
                  rows="4"
                  value={Array.isArray(project[name]) ? project[name].join("\n") : ""}
                  onChange={(event) => updateField(name, event.target.value)}
                />
              </label>
            ))}

            <label className="admin-field">
              <span>ترتیب نمایش</span>
              <input
                type="number"
                value={project.sort_order}
                onChange={(event) =>
                  updateField("sort_order", event.target.value)
                }
              />
            </label>

            <label className="admin-field">
              <span>Case study (JSON اختیاری)</span>
              <textarea
                rows="4"
                value={
                  typeof project.case_study === "string"
                    ? project.case_study
                    : JSON.stringify(project.case_study, null, 2)
                }
                onChange={(event) =>
                  updateField("case_study", event.target.value)
                }
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
              پروژه شاخص
            </label>
            <label>
              <input
                type="checkbox"
                checked={project.published}
                onChange={(event) =>
                  updateField("published", event.target.checked)
                }
              />
              منتشر شود
            </label>
          </div>

          <div className="admin-actions">
            <button disabled={busy}>
              {busy ? "در حال ذخیره..." : "ذخیره پروژه"}
            </button>
            <button
              type="button"
              className="admin-secondary"
              onClick={startNew}
            >
              پاک‌کردن فرم
            </button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <h2>فهرست پروژه‌ها</h2>

        {projects.length === 0 ? (
          <p>هنوز پروژه‌ای وجود ندارد.</p>
        ) : (
          <div className="admin-project-list">
            {projects.map((item) => (
              <article className="admin-project" key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>
                    {item.category || "بدون دسته‌بندی"} · {item.slug}
                  </p>
                  <span
                    className={
                      item.published ? "admin-status is-published" : "admin-status"
                    }
                  >
                    {item.published ? "منتشرشده" : "پیش‌نویس"}
                  </span>
                  {item.featured ? (
                    <span className="admin-status">پروژه شاخص</span>
                  ) : null}
                </div>

                <div className="admin-actions">
                  <button type="button" onClick={() => editProject(item)}>
                    ویرایش
                  </button>
                  <button
                    type="button"
                    className="admin-danger"
                    onClick={() => deleteProject(item)}
                  >
                    حذف
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