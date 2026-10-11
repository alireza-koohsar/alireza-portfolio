const SESSION_COOKIE = "admin_session";
const SESSION_DURATION = 60 * 60 * 24;
const PROJECT_COLUMNS = [
  "title", "slug", "category", "year", "client", "description", "role",
  "cover", "hero", "video", "tools", "gallery", "services", "software",
  "tags", "case_study", "featured", "published", "sort_order",
];
const LIST_FIELDS = ["tools", "gallery", "services", "software", "tags"];

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extraHeaders },
  });
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const entry = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? entry.slice(name.length + 1) : null;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signSession(payload, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

async function verifySession(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || !env.ADMIN_SESSION_SECRET) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  try {
    const expected = await signSession(JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[0]))), env.ADMIN_SESSION_SECRET);
    const expectedSignature = expected.split(".")[1];
    if (parts[1].length !== expectedSignature.length) return false;
    let mismatch = 0;
    for (let i = 0; i < parts[1].length; i++) mismatch |= parts[1].charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    if (mismatch !== 0) return false;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[0])));
    return Number(payload.exp) > Math.floor(Date.now() / 1000) && payload.role === "admin";
  } catch {
    return false;
  }
}

function isSameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

function parseMaybeJson(value, fallback = []) {
  if (Array.isArray(value) || (value && typeof value === "object")) return value;
  if (typeof value !== "string" || !value.trim()) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function normalizeProject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid form data.");
  const title = String(body.title ?? "").trim();
  const slug = String(body.slug ?? "").trim();
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "").trim();
  if (!title || !slug || !category || !description) {
    throw new Error("Project title, slug, category, and description are required.");
  }
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) throw new Error("Project slug can only contain English letters, numbers, and hyphens.");
  let year = body.year === "" || body.year == null ? null : Number(body.year);
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) throw new Error("Invalid project year.");
  const sortOrder = Number(body.sort_order ?? 0);
  if (!Number.isFinite(sortOrder)) throw new Error("Invalid display order.");
  const project = {
    title, slug, category, year,
    client: String(body.client ?? "").trim(),
    description,
    role: String(body.role ?? "").trim(),
    cover: String(body.cover ?? "").trim(),
    hero: String(body.hero ?? "").trim(),
    video: String(body.video ?? "").trim(),
    case_study: JSON.stringify(parseMaybeJson(body.case_study, {})),
    featured: body.featured ? 1 : 0,
    published: body.published ? 1 : 0,
    sort_order: Math.trunc(sortOrder),
  };
  for (const field of LIST_FIELDS) {
    const value = Array.isArray(body[field]) ? body[field] : parseMaybeJson(body[field], []);
    project[field] = JSON.stringify(Array.isArray(value) ? value : []);
  }
  return project;
}

function parseProject(row) {
  if (!row) return row;
  const result = { ...row };
  for (const field of LIST_FIELDS) result[field] = parseMaybeJson(result[field], []);
  result.case_study = parseMaybeJson(result.case_study, {});
  result.featured = Boolean(result.featured);
  result.published = Boolean(result.published);
  return result;
}

function isUniqueConstraint(error) {
  return /unique constraint|UNIQUE constraint/i.test(String(error?.message || error));
}

async function handleAdminApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  if (path === "/api/admin/login" && method === "POST") {
    if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
    if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return json({ error: "Login configuration is incomplete." }, 500);
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid form data." }, 400); }
    if (typeof body.password !== "string" || body.password !== env.ADMIN_PASSWORD) return json({ error: "Incorrect password." }, 401);
    const token = await signSession({ role: "admin", exp: Math.floor(Date.now() / 1000) + SESSION_DURATION }, env.ADMIN_SESSION_SECRET);
    return json({ ok: true, authenticated: true }, 200, {
      "Set-Cookie": `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION}`,
    });
  }

  if (path === "/api/admin/logout" && method === "POST") {
    if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
    return json({ ok: true }, 200, { "Set-Cookie": `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` });
  }

  if (path === "/api/admin/session" && method === "GET") {
    return json({ authenticated: await verifySession(request, env) });
  }

  if (!path.startsWith("/api/admin/")) return json({ error: "Route not found." }, 404);
  if (!await verifySession(request, env)) return json({ error: "Please log in first." }, 401);
  if (method !== "GET" && !isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);

  if (path === "/api/admin/projects" && method === "GET") {
    const result = await env.portfolio_db.prepare("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC").all();
    return json({ projects: (result.results || []).map(parseProject) });
  }

  if (path === "/api/admin/projects" && method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid form data." }, 400); }
    let project;
    try { project = normalizeProject(body); } catch (error) { return json({ error: error.message || "Invalid form data." }, 400); }
    const id = crypto.randomUUID();
    const columns = ["id", ...PROJECT_COLUMNS];
    const values = [id, ...PROJECT_COLUMNS.map((column) => project[column])];
    const placeholders = columns.map(() => "?").join(", ");
    try {
      await env.portfolio_db.prepare(`INSERT INTO projects (${columns.join(", ")}) VALUES (${placeholders})`).bind(...values).run();
      const row = await env.portfolio_db.prepare("SELECT * FROM projects WHERE id = ?").bind(id).first();
      return json({ ok: true, id, project: parseProject(row) }, 201);
    } catch (error) {
      if (isUniqueConstraint(error)) return json({ error: "This slug is already in use." }, 409);
      return json({ error: "Failed to save project." }, 500);
    }
  }

  if (path === "/api/admin/projects/reorder" && method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid form data." }, 400); }
    if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string") || new Set(body.ids).size !== body.ids.length) {
      return json({ error: "Invalid project order." }, 400);
    }
    try {
      const existing = await env.portfolio_db.prepare("SELECT id FROM projects").all();
      const existingIds = new Set((existing.results || []).map((row) => row.id));
      if (body.ids.length !== existingIds.size || body.ids.some((id) => !existingIds.has(id))) return json({ error: "Project list changed. Refresh and try again." }, 409);
      const statements = body.ids.map((id, index) => env.portfolio_db.prepare("UPDATE projects SET sort_order = ? WHERE id = ?").bind(index, id));
      if (statements.length) await env.portfolio_db.batch(statements);
      return json({ ok: true });
    } catch {
      return json({ error: "Failed to save project order." }, 500);
    }
  }

  const projectMatch = path.match(/^\/api\/admin\/projects\/([^/]+)$/);
  if (projectMatch) {
    const id = decodeURIComponent(projectMatch[1]);
    if (method === "PUT") {
      let body;
      try { body = await request.json(); } catch { return json({ error: "Invalid form data." }, 400); }
      let project;
      try { project = normalizeProject(body); } catch (error) { return json({ error: error.message || "Invalid form data." }, 400); }
      const assignments = PROJECT_COLUMNS.map((column) => `${column} = ?`).join(", ");
      try {
        const result = await env.portfolio_db.prepare(`UPDATE projects SET ${assignments} WHERE id = ?`).bind(...PROJECT_COLUMNS.map((column) => project[column]), id).run();
        if (!result.meta?.changes) return json({ error: "Project not found." }, 404);
        const row = await env.portfolio_db.prepare("SELECT * FROM projects WHERE id = ?").bind(id).first();
        return json({ ok: true, project: parseProject(row) });
      } catch (error) {
        if (isUniqueConstraint(error)) return json({ error: "This slug is already in use." }, 409);
        return json({ error: "Failed to update project." }, 500);
      }
    }
    if (method === "DELETE") {
      const result = await env.portfolio_db.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
      if (!result.meta?.changes) return json({ error: "Project not found." }, 404);
      return json({ ok: true });
    }
  }

  return json({ error: "Route not found." }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/api/admin/")) return await handleAdminApi(request, env);
      if (url.pathname === "/api/health") return json({ ok: true });
      if (url.pathname === "/api/db-check") {
        const result = await env.portfolio_db.prepare("SELECT COUNT(*) AS count FROM projects").first();
        return json({ ok: true, projects: result?.count ?? 0 });
      }
      if (url.pathname === "/api/projects" && request.method === "GET") {
        const result = await env.portfolio_db.prepare("SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC, created_at DESC").all();
        const projects = (result.results || []).map((row) => {
          const parsed = parseProject(row);
          return {
            ...parsed,
            caseStudy: parsed.case_study,
            media: { cover: parsed.cover, hero: parsed.hero, video: parsed.video, gallery: parsed.gallery },
          };
        });

return json(projects, 200, {
  "Cache-Control": "public, max-age=60, s-maxage=60"
});
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      return json({ error: "A server error occurred." }, 500);
    }
  },
};
