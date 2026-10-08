import { Link } from "react-router-dom";

function ProjectCard({
  id,
  title,
  category,
  year,
  image,
  video,
}) {
  return (
    <article className="project-card">

<div className="project-card-meta">
  <span>{category}</span>
  <span>{year}</span>
</div>

      <div className="project-image">

        {video ? (
          <video
            src={video}
            poster={image}
            controls
            playsInline
            preload="metadata"
          />
        ) : image ? (
          <img
            src={image}
            alt={title}
          />
        ) : (
          <div className="project-placeholder">
            {category}
          </div>
        )}

      </div>

      <div className="project-info">

        <h3>{title}</h3>

        <Link
          to={`/work/${id}`}
          className="project-card-details"
        >
          View Project →
        </Link>

      </div>

    </article>
  );
}

export default ProjectCard;