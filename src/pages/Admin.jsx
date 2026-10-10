import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "";
const SITE_URL = "https://portfolio.etelix.ir";

const emptyProject = () => ({
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
  case_study: { challenge: "", solution: "", result: "" },
  featured: false,
  published: false,
  sort_order: 0,
});

const listFields = ["tools", "gallery", "services", "software", "tags"];
const requiredFields = ["title", "slug", "category", "description"];

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "same-origin",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function toFormProject(item = {}) {
  const project = { ...emptyProject(), ...item };
  for (const field of listFields) {
    const value = project[field];
    project[field] = Array.isArray(value) ? value.join("\n") : (value || "");
  }
  if (typeof project.case_study === "string") {
    try { project.case_study = JSON.parse(project.case_study); } catch { project.case_study = {}; }
  }
  project.case_study = { challenge: "", solution: "", result: "", ...(project.case_study || {}) };
  project.featured = Boolean(project.featured);
  project.published = Boolean(project.published);
  return project;
}

function toPayload(project) {
  const payload = { ...project };
  for (const field of listFields) {
    payload[field] = String(project[field] || "")
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  payload.year = project.year === "" || project.year == null ? null : Number(project.year);
  payload.sort_order = Number(project.sort_order || 0);
  payload.featured = Boolean(project.featured);
  payload.published = Boolean(project.published);
  return payload;
}

function projectUrl(item) {
  return `${SITE_URL}/work/${encodeURIComponent(item.id)}`;
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [menuId, setMenuId] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedId, setDraggedId] = useState(null);

  const isValid = useMemo(
    () => requiredFields.every((field) => String(project[field] ?? "").trim().length > 0),
    [project]
  );

  const loadProjects = useCallback(async () => {
    const data = await api("/api/admin/projects");
    setProjects(Array.isArray(data.projects) ? data.projects : []);
  }, []);

  useEffect(() => {
    let active = true;
    api("/api/admin/session")
      .then(async (data) => {
        if (!active) return;
        setAuthenticated(Boolean(data.authenticated));
        if (data.authenticated) await loadProjects();
      })
      .catch(() => {})
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [loadProjects]);

  async function login(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      setAuthenticated(true);
      setPassword("");
      await loadProjects();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true);
    try { await api("/api/admin/logout", { method: "POST" }); }
    catch (err) { setError(err.message); }
    finally {
      setAuthenticated(false); setProjects([]); setEditingId(null); setSavedId(null);
      setProject(emptyProject()); setBusy(false);
    }
  }

  function startNew() {
    setProject(emptyProject()); setEditingId(null); setSavedId(null);
    setError(""); setNotice("");
  }

  function editProject(item) {
    setProject(toFormProject(item)); setEditingId(item.id); setSavedId(item.id);
    setError(""); setNotice(""); setMenuId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateField(field, value) {
    setProject((current) => ({ ...current, [field]: value }));
    setSavedId(null);
  }

  async function saveProject(event) {
    event.preventDefault();
    setError(""); setNotice("");
    if (!isValid) {
      setError("Please complete Project Title, Slug, Category, and Project Description before saving.");
      return;
    }
    setBusy(true);
    try {
      const payload = toPayload(project);
      const data = editingId
        ? await api(`/api/admin/projects/${encodeURIComponent(editingId)}`, { method: "PUT", body: JSON.stringify(payload) })
        : await api("/api/admin/projects", { method: "POST", body: JSON.stringify(payload) });
      const savedProject = data.project || { ...payload, id: editingId || data.id };
      const id = savedProject.id || editingId || data.id;
      const normalized = toFormProject({ ...savedProject, id });
      setProject(normalized);
      setEditingId(id);
      setSavedId(id);
      setNotice("Project saved successfully. Your changes are preserved in the form.");
      await loadProjects();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function deleteProject(item) {
    setMenuId(null);
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api(`/api/admin/projects/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      if (editingId === item.id) startNew();
      await loadProjects();
      setNotice("Project deleted.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function togglePublished(item) {
    setMenuId(null); setBusy(true); setError(""); setNotice("");
    try {
      const payload = toPayload(toFormProject(item));
      payload.published = !Boolean(item.published);
      await api(`/api/admin/projects/${encodeURIComponent(item.id)}`, { method: "PUT", body: JSON.stringify(payload) });
      await loadProjects();
      if (editingId === item.id) setProject((current) => ({ ...current, published: payload.published }));
      setNotice(payload.published ? "Project published." : "Project unpublished.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function duplicateProject(item) {
    setMenuId(null); setBusy(true); setError(""); setNotice("");
    try {
      const copy = toPayload(toFormProject(item));
      delete copy.id; delete copy.created_at; delete copy.updated_at;
      copy.title = `${item.title} (Copy)`;
      const baseSlug = `${item.slug || "project"}-copy`;
      copy.slug = baseSlug;
      copy.published = false;
      copy.featured = false;
      const existing = new Set(projects.map((p) => p.slug));
      let suffix = 2;
      while (existing.has(copy.slug)) copy.slug = `${baseSlug}-${suffix++}`;
      const data = await api("/api/admin/projects", { method: "POST", body: JSON.stringify(copy) });
      await loadProjects();
      if (data.project) editProject(data.project);
      else if (data.id) editProject({ ...copy, id: data.id });
      setNotice("Project duplicated. Review the copy before publishing.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  function moveProject(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return;
    setProjects((current) => {
      const next = [...current];
      const from = next.findIndex((item) => item.id === fromId);
      const to = next.findIndex((item) => item.id === toId);
      if (from < 0 || to < 0) return current;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function saveOrder() {
    setBusy(true); setError(""); setNotice("");
    try {
      await api("/api/admin/projects/reorder", {
        method: "POST",
        body: JSON.stringify({ ids: projects.map((item) => item.id) }),
      });
      await loadProjects();
      setReorderMode(false);
      setNotice("Project order saved.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); setDraggedId(null); }
  }

  if (checking) return <main className="admin-shell"><p>Checking session…</p></main>;

  if (!authenticated) {
    return (
      <main className="admin-shell">
        <section className="admin-panel" style={{ maxWidth: 440, margin: "10vh auto" }}>
          <h1>Portfolio Admin</h1>
          <p>Sign in to manage your projects.</p>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <form onSubmit={login} className="admin-grid">
            <label className="admin-field admin-full">Password
              <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <div className="admin-actions admin-full"><button type="submit" disabled={busy || !password}>{busy ? "Signing in…" : "Sign in"}</button></div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div><h1>Portfolio Admin</h1><p>Manage, publish, and organize your work.</p></div>
        <div className="admin-actions"><button type="button" className="admin-secondary" onClick={startNew}>New Project</button><button type="button" className="admin-secondary" onClick={logout} disabled={busy}>Log out</button></div>
      </header>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <section className="admin-panel">
        <h2>{editingId ? "Edit Project" : "Create Project"}</h2>
        <p>Title, slug, category, and description are required.</p>
        <form onSubmit={saveProject} className="admin-grid">
          <label className="admin-field">Project Title *<input value={project.title} onChange={(e) => updateField("title", e.target.value)} required /></label>
          <label className="admin-field">Slug *<input value={project.slug} onChange={(e) => updateField("slug", e.target.value.trim().replace(/\s+/g, "-").toLowerCase())} required pattern="[a-zA-Z0-9-]+" title="Use English letters, numbers, and hyphens only." /></label>
          <label className="admin-field">Category *<input value={project.category} onChange={(e) => updateField("category", e.target.value)} required /></label>
          <label className="admin-field">Year<input type="number" min="1900" max="2200" value={project.year ?? ""} onChange={(e) => updateField("year", e.target.value)} /></label>
          <label className="admin-field">Client<input value={project.client} onChange={(e) => updateField("client", e.target.value)} /></label>
          <label className="admin-field">My Role<input value={project.role} onChange={(e) => updateField("role", e.target.value)} /></label>
          <label className="admin-field admin-full">Project Description *<textarea rows="4" value={project.description} onChange={(e) => updateField("description", e.target.value)} required /></label>
          <label className="admin-field admin-full">Cover Image URL<input type="url" value={project.cover} onChange={(e) => updateField("cover", e.target.value)} placeholder="https://…" /></label>
          <label className="admin-field admin-full">Hero Image URL<input type="url" value={project.hero} onChange={(e) => updateField("hero", e.target.value)} placeholder="https://…" /></label>
          <label className="admin-field admin-full">Video URL<input type="url" value={project.video} onChange={(e) => updateField("video", e.target.value)} placeholder="https://…" /></label>
          {listFields.map((field) => (
            <label className="admin-field admin-full" key={field}>{field[0].toUpperCase() + field.slice(1)} <span style={{ fontWeight: 400 }}>(one item per line)</span>
              <textarea rows={field === "gallery" ? 3 : 2} value={project[field] || ""} onChange={(e) => updateField(field, e.target.value)} placeholder={field === "gallery" ? "https://image-1…\nhttps://image-2…" : "One item per line"} />
            </label>
          ))}
          <div className="admin-field admin-full"><h3>Case Study</h3></div>
          {[["challenge", "Challenge"], ["solution", "Solution"], ["result", "Result"]].map(([key, label]) => (
            <label className="admin-field admin-full" key={key}>{label}
              <textarea rows="2" value={project.case_study?.[key] || ""} onChange={(e) => setProject((current) => ({ ...current, case_study: { ...(current.case_study || {}), [key]: e.target.value } }))} />
            </label>
          ))}
          <label className="admin-field">Display Order<input type="number" value={project.sort_order ?? 0} onChange={(e) => updateField("sort_order", e.target.value)} /></label>
          <div className="admin-options admin-full">
            <label><input type="checkbox" checked={project.featured} onChange={(e) => updateField("featured", e.target.checked)} /> Featured</label>
            <label><input type="checkbox" checked={project.published} onChange={(e) => updateField("published", e.target.checked)} /> Published</label>
          </div>
          <div className="admin-actions admin-full" style={{ flexWrap: "wrap" }}>
            <button type="submit" disabled={busy || !isValid}>{busy ? "Saving…" : editingId ? "Save Changes" : "Save Project"}</button>
            {savedId && <button type="button" className="admin-secondary" onClick={() => window.open(projectUrl({ id: savedId }), "_blank", "noopener,noreferrer")}>View Project ↗</button>}
            <button type="button" className="admin-secondary" onClick={startNew} disabled={busy}>Clear Form</button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-header" style={{ alignItems: "center" }}>
          <div><h2>Projects ({projects.length})</h2><p>Manage each project or reorder the list.</p></div>
          <div className="admin-actions">
            <button type="button" className="admin-secondary" onClick={() => { setReorderMode((v) => !v); setDraggedId(null); }} disabled={busy}>{reorderMode ? "Cancel Reordering" : "Reorder Projects"}</button>
            {reorderMode && <button type="button" onClick={saveOrder} disabled={busy}>{busy ? "Saving…" : "Save Order"}</button>}
          </div>
        </div>
        <div className="admin-project-list">
          {projects.map((item) => (
            <article
              className="admin-project"
              key={item.id}
              draggable={reorderMode && !busy}
              onDragStart={() => setDraggedId(item.id)}
              onDragOver={(event) => { if (reorderMode) event.preventDefault(); }}
              onDrop={(event) => { event.preventDefault(); moveProject(draggedId, item.id); }}
              style={{ opacity: draggedId === item.id ? 0.55 : 1, cursor: reorderMode ? "grab" : "default", position: "relative" }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0, flex: 1 }}>
                {reorderMode && <span aria-label="Drag to reorder" title="Drag to reorder" style={{ fontSize: 22, cursor: "grab" }}>⠿</span>}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3>{item.title || "Untitled Project"}</h3>
                  <p>{item.category || "Uncategorized"}{item.year ? ` · ${item.year}` : ""}{item.slug ? ` · /${item.slug}` : ""}</p>
                  <div className="admin-status">
                    <span className={item.published ? "is-published" : ""}>{item.published ? "Published" : "Draft"}</span>
                    {item.featured && <span>Featured</span>}
                  </div>
                </div>
              </div>
              {!reorderMode && <div className="admin-actions" style={{ alignItems: "flex-start" }}>
                <button type="button" className="admin-secondary" onClick={() => editProject(item)}>Edit</button>
                <div style={{ position: "relative" }}>
                  <button type="button" className="admin-secondary" aria-label={`More actions for ${item.title}`} aria-expanded={menuId === item.id} onClick={() => setMenuId((current) => current === item.id ? null : item.id)}>⋯</button>
                  {menuId === item.id && <div role="menu" style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 20, minWidth: 190, padding: 6, background: "var(--admin-menu-bg, #fff)", color: "var(--admin-menu-text, #111)", border: "1px solid #ddd", borderRadius: 10, boxShadow: "0 8px 24px #0002" }}>
                    <button role="menuitem" type="button" className="admin-menu-item" onClick={() => { setMenuId(null); window.open(projectUrl(item), "_blank", "noopener,noreferrer"); }}>View Project ↗</button>
                    <button role="menuitem" type="button" className="admin-menu-item" onClick={() => togglePublished(item)}>{item.published ? "Unpublish Project" : "Publish Project"}</button>
                    <button role="menuitem" type="button" className="admin-menu-item" onClick={() => duplicateProject(item)}>Duplicate Project</button>
                    <button role="menuitem" type="button" className="admin-menu-item admin-danger" onClick={() => deleteProject(item)}>Delete Project</button>
                  </div>}
                </div>
              </div>}
            </article>
          ))}
          {!projects.length && <p>No projects yet. Create your first project above.</p>}
        </div>
      </section>
      <style>{`
        .admin-menu-item { display:block; width:100%; padding:10px 12px; border:0; border-radius:6px; text-align:left; background:transparent; color:inherit; cursor:pointer; font:inherit; }
        .admin-menu-item:hover { background:rgba(127,127,127,.12); }
        .admin-menu-item.admin-danger { color:#c62828; }
        .admin-project { gap:14px; }
        .admin-field input, .admin-field textarea { max-width:100%; box-sizing:border-box; }
        @media (max-width:640px) { .admin-header { gap:12px; align-items:flex-start; flex-direction:column; } .admin-project { flex-direction:column; align-items:stretch; } .admin-project > .admin-actions { align-self:flex-start; } }
      `}</style>
    </main>
  );
}
