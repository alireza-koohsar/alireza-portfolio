
import { useState } from "react";
import useProjects from "../hooks/useProjects";
import ProjectCard from "../components/ProjectCard";

function Work() {
  const [activeFilter, setActiveFilter] = useState("All");
  const { projects, loading, error } = useProjects();

  const categories = [
    "All",
    "Motion",
    "Graphic Design",
  ];

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter(
          (project) => project.category === activeFilter
        );

  return (
    <main className="work-page">
      <section className="work-header">
        <p className="section-label">SELECTED WORK</p>

        <h1>
          Projects, experiments
          <br />
          & visual stories.
        </h1>

        <p className="work-intro">
          A selection of visual design, motion graphics,
          3D and digital projects created across different
          industries and creative environments.
        </p>
      </section>

      <section className="work-content">
        <div className="work-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={
                activeFilter === category
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setActiveFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading && (
          <p>Loading projects...</p>
        )}

        {error && (
          <p role="alert">{error}</p>
        )}

        {!loading && !error && filteredProjects.length === 0 && (
          <p>No projects found in this category.</p>
        )}

        {!loading && !error && filteredProjects.length > 0 && (
          <div className="work-grid">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                category={project.category}
                year={project.year}
                image={project.media.cover}
                video={project.media.video}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Work;