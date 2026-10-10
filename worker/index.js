const SESSION_DURATION = 60 * 60 * 24;

function json(data, status = 200, extraHeaders = {}) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const entry = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return entry ? entry.slice(name.length + 1) : null;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signSession(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const data = new TextEncoder().encode(payload);
  const signature = await crypto.subtle.sign("HMAC", key, data);

  return bytesToBase64Url(signature);
}

async function verifySession(request, env) {
  const token = getCookie(request, "admin_session");
  if (!token || !env.ADMIN_SESSION_SECRET) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  try {
    const expected = await signSession(payload, env.ADMIN_SESSION_SECRET);
    const suppliedBytes = new TextEncoder().encode(signature);
    const expectedBytes = new TextEncoder().encode(expected);

    if (suppliedBytes.length !== expectedBytes.length) return false;

    let difference = 0;
    for (let i = 0; i < suppliedBytes.length; i++) {
      difference |= suppliedBytes[i] ^ expectedBytes[i];
    }
    if (difference !== 0) return false;

    const session = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload)),
    );

    return (
      session.exp > Math.floor(Date.now() / 1000) &&
      session.admin === true
    );
  } catch {
    return false;
  }
}

function isSameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function normalizeProject(body) {
  const stringFields = [
    "title",
    "slug",
    "category",
    "client",
    "description",
    "role",
    "cover",
    "hero",
    "video",
  ];

  const project = {};

  for (const field of stringFields) {
    project[field] = String(body[field] ?? "").trim();
  }

  project.year =
    body.year === "" || body.year == null ? null : Number(body.year);

  project.sort_order = Number(body.sort_order ?? 0);
  project.featured = body.featured ? 1 : 0;
  project.published = body.published ? 1 : 0;

  for (const field of ["tools", "gallery", "services", "software", "tags"]) {
    const value = body[field] ?? [];
    project[field] = JSON.stringify(
      Array.isArray(value)
        ? value.map(String).map((item) => item.trim()).filter(Boolean)
        : String(value)
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
    );
  }

  const caseStudy = body.case_study ?? body.caseStudy ?? {};
  project.case_study = JSON.stringify(
    typeof caseStudy === "object" && caseStudy !== null
      ? caseStudy
      : {},
  );

  if (!project.title || !project.slug) {
    throw new Error("عنوان و شناسه پروژه الزامی است.");
  }

  if (!/^[a-zA-Z0-9-]+$/.test(project.slug)) {
    throw new Error("شناسه پروژه فقط می‌تواند شامل حروف انگلیسی، عدد و خط تیره باشد.");
  }

  if (
    project.year !== null &&
    (!Number.isInteger(project.year) ||
      project.year < 1900 ||
      project.year > 2200)
  ) {
    throw new Error("سال پروژه معتبر نیست.");
  }

  if (!Number.isFinite(project.sort_order)) {
    throw new Error("ترتیب نمایش معتبر نیست.");
  }

  return project;
}

async function handleAdminApi(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  if (path === "/api/admin/login" && method === "POST") {
    if (!isSameOrigin(request)) {
      return json({ error: "درخواست نامعتبر است." }, 403);
    }

    if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
      return json({ error: "تنظیمات ورود کامل نیست." }, 500);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "درخواست نامعتبر است." }, 400);
    }

    if (
      typeof body.password !== "string" ||
      body.password.length > 1024 ||
      body.password !== env.ADMIN_PASSWORD
    ) {
      return json({ error: "رمز عبور اشتباه است." }, 401);
    }

    const payload = bytesToBase64Url(
      new TextEncoder().encode(
        JSON.stringify({
          admin: true,
          exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
        }),
      ),
    );

    const signature = await signSession(payload, env.ADMIN_SESSION_SECRET);
    const token = `${payload}.${signature}`;

    return json(
      { ok: true },
      200,
      {
        "Set-Cookie": [
          `admin_session=${token}`,
          "HttpOnly",
          "Secure",
          "SameSite=Strict",
          "Path=/",
          `Max-Age=${SESSION_DURATION}`,
        ].join("; "),
      },
    );
  }

  if (path === "/api/admin/logout" && method === "POST") {
    if (!isSameOrigin(request)) {
      return json({ error: "درخواست نامعتبر است." }, 403);
    }

    return json(
      { ok: true },
      200,
      {
        "Set-Cookie":
          "admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
      },
    );
  }

  if (path === "/api/admin/session" && method === "GET") {
    const authenticated = await verifySession(request, env);
    return json({ authenticated });
  }

  if (!(await verifySession(request, env))) {
    return json({ error: "ابتدا وارد پنل شوید." }, 401);
  }

  if (method !== "GET" && !isSameOrigin(request)) {
    return json({ error: "درخواست نامعتبر است." }, 403);
  }

  if (path === "/api/admin/projects" && method === "GET") {
    const { results } = await env.portfolio_db
      .prepare(
        `SELECT id, title, slug, category, year, client, description,
          tools, cover, hero, video, gallery, role, services, software,
          tags, case_study, featured, published, sort_order, created_at,
          updated_at
        FROM projects
        ORDER BY sort_order ASC, created_at DESC`,
      )
      .all();

    return json(
      results.map((project) => ({
        ...project,
        tools: JSON.parse(project.tools || "[]"),
        gallery: JSON.parse(project.gallery || "[]"),
        services: JSON.parse(project.services || "[]"),
        software: JSON.parse(project.software || "[]"),
        tags: JSON.parse(project.tags || "[]"),
        case_study: JSON.parse(project.case_study || "{}"),
      })),
    );
  }

  if (path === "/api/admin/projects" && method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "داده‌های فرم معتبر نیستند." }, 400);
    }

    let project;
    try {
      project = normalizeProject(body);
    } catch (error) {
      return json({ error: error.message }, 400);
    }

    const id = crypto.randomUUID();

    try {
      await env.portfolio_db
        .prepare(
          `INSERT INTO projects (
            id, title, slug, category, year, client, description, tools,
            cover, hero, video, gallery, role, services, software, tags,
            case_study, featured, published, sort_order, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            CURRENT_TIMESTAMP
          )`,
        )
        .bind(
          id,
          project.title,
          project.slug,
          project.category,
          project.year,
          project.client,
          project.description,
          project.tools,
          project.cover,
          project.hero,
          project.video,
          project.gallery,
          project.role,
          project.services,
          project.software,
          project.tags,
          project.case_study,
          project.featured,
          project.published,
          project.sort_order,
        )
        .run();

      return json({ ok: true, id }, 201);
    } catch (error) {
      return json(
        {
          error: String(error?.message || "").includes("UNIQUE")
            ? "این شناسه قبلاً استفاده شده است."
            : "ذخیره پروژه انجام نشد.",
        },
        400,
      );
    }
  }

  const projectMatch = path.match(/^\/api\/admin\/projects\/([^/]+)$/);

  if (projectMatch) {
    const id = decodeURIComponent(projectMatch[1]);

    if (method === "PUT") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "داده‌های فرم معتبر نیستند." }, 400);
      }

      let project;
      try {
        project = normalizeProject(body);
      } catch (error) {
        return json({ error: error.message }, 400);
      }

      try {
        const result = await env.portfolio_db
          .prepare(
            `UPDATE projects SET
              title = ?, slug = ?, category = ?, year = ?, client = ?,
              description = ?, tools = ?, cover = ?, hero = ?, video = ?,
              gallery = ?, role = ?, services = ?, software = ?, tags = ?,
              case_study = ?, featured = ?, published = ?, sort_order = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
          )
          .bind(
            project.title,
            project.slug,
            project.category,
            project.year,
            project.client,
            project.description,
            project.tools,
            project.cover,
            project.hero,
            project.video,
            project.gallery,
            project.role,
            project.services,
            project.software,
            project.tags,
            project.case_study,
            project.featured,
            project.published,
            project.sort_order,
            id,
          )
          .run();

        if (!result.meta.changes) {
          return json({ error: "پروژه پیدا نشد." }, 404);
        }

        return json({ ok: true });
      } catch (error) {
        return json(
          {
            error: String(error?.message || "").includes("UNIQUE")
              ? "این شناسه قبلاً استفاده شده است."
              : "ویرایش پروژه انجام نشد.",
          },
          400,
        );
      }
    }

    if (method === "DELETE") {
      const result = await env.portfolio_db
        .prepare("DELETE FROM projects WHERE id = ?")
        .bind(id)
        .run();

      if (!result.meta.changes) {
        return json({ error: "پروژه پیدا نشد." }, 404);
      }

      return json({ ok: true });
    }
  }

  return json({ error: "مسیر پیدا نشد." }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/admin/")) {
      try {
        return await handleAdminApi(request, env, url);
      } catch {
        return json({ error: "خطای سرور رخ داد." }, 500);
      }
    }

    if (url.pathname === "/api/health") {
      return json({
        status: "ok",
        message: "Portfolio API is running",
      });
    }

    if (url.pathname === "/api/db-check") {
      try {
        const result = await env.portfolio_db
          .prepare(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'projects'",
          )
          .first();

        return json({
          status: result ? "ok" : "error",
          database: result ? "connected" : "projects table not found",
        });
      } catch {
        return json(
          { status: "error", message: "Database connection failed" },
          500,
        );
      }
    }

    if (url.pathname === "/api/projects") {
      try {
        const { results } = await env.portfolio_db
          .prepare(
            `SELECT
              id, title, slug, category, year, client, description,
              tools, cover, hero, video, gallery, role, services,
              software, tags, case_study, featured, published, sort_order
            FROM projects
            WHERE published = 1
            ORDER BY sort_order ASC, created_at DESC`,
          )
          .all();

        const projects = results.map((project) => ({
          ...project,
          tools: JSON.parse(project.tools || "[]"),
          gallery: JSON.parse(project.gallery || "[]"),
          services: JSON.parse(project.services || "[]"),
          software: JSON.parse(project.software || "[]"),
          tags: JSON.parse(project.tags || "[]"),
          caseStudy: JSON.parse(project.case_study || "{}"),
          media: {
            cover: project.cover || null,
            hero: project.hero || null,
            video: project.video || null,
            gallery: JSON.parse(project.gallery || "[]"),
          },
        }));

        return json(projects);
      } catch {
        return json({ error: "Could not load projects" }, 500);
      }
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "Not found" }, 404);
    }

    return new Response(null, { status: 404 });
  },
};