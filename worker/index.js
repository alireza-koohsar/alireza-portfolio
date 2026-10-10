
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({
        status: "ok",
        message: "Portfolio API is running",
      });
    }

    if (url.pathname === "/api/db-check") {
      try {
        const result = await env.portfolio_db
          .prepare(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'projects'"
          )
          .first();

        return Response.json({
          status: result ? "ok" : "error",
          database: result ? "connected" : "projects table not found",
        });
      } catch {
        return Response.json(
          { status: "error", message: "Database connection failed" },
          { status: 500 }
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
            ORDER BY sort_order ASC, created_at DESC`
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

        return Response.json(projects);
      } catch {
        return Response.json(
          { error: "Could not load projects" },
          { status: 500 }
        );
      }
    }

    if (url.pathname.startsWith("/api/")) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return new Response(null, { status: 404 });
  },
};