
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useProjects from "../hooks/useProjects";

function Project() {
  const { projectId } = useParams();
  const { projects, loading, error } = useProjects();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Swipe
  const [touchStartX, setTouchStartX] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const project = projects.find(
    (item) => item.id === projectId
  );

  /* =========================
     SWIPE
     ========================= */

  const handleTouchStart = (e) => {
    if (isAnimating) return;

    setTouchStartX(e.touches[0].clientX);
    setDragX(0);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchStartX === null || isAnimating) return;

    const currentX = e.touches[0].clientX;
    const distance = currentX - touchStartX;

    setDragX(distance);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || isAnimating) return;

    const minSwipeDistance = 80;
    const galleryLength = project.media.gallery.length;

    if (Math.abs(dragX) >= minSwipeDistance) {
      setIsDragging(false);
      setIsAnimating(true);

      const direction = dragX < 0 ? -1 : 1;

      setDragX(direction * window.innerWidth);

      setTimeout(() => {
        setLightboxIndex((current) => {
          if (direction < 0) {
            return current === galleryLength - 1
              ? 0
              : current + 1;
          }

          return current === 0
            ? galleryLength - 1
            : current - 1;
        });

        setDragX(-direction * window.innerWidth);

        requestAnimationFrame(() => {
          setIsAnimating(false);
          setDragX(0);
        });
      }, 300);

    } else {
      setIsDragging(false);
      setDragX(0);
    }

    setTouchStartX(null);
  };

  /* =========================
     KEYBOARD
     ========================= */

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (isAnimating) return;

      if (e.key === "Escape") {
        setLightboxIndex(null);
      }

      if (e.key === "ArrowLeft") {
        setLightboxIndex((current) =>
          current === 0
            ? project.media.gallery.length - 1
            : current - 1
        );
      }

      if (e.key === "ArrowRight") {
        setLightboxIndex((current) =>
          current === project.media.gallery.length - 1
            ? 0
            : current + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, project, isAnimating]);

  /* =========================
     PROJECT NOT FOUND
     ========================= */


  if (loading) {
    return (
      <main className="project-page">
        <p>Loading project...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="project-page">
        <p role="alert">{error}</p>
        <Link to="/work">← Back to Work</Link>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="project-page">
        <h1>Project not found</h1>
        <Link to="/work">← Back to Work</Link>
      </main>
    );
  }

  return (
    <main className="project-page">

      {/* HERO */}

      <section className="project-hero">

        <p className="section-label">
          {project.category}
        </p>

        <h1>
          {project.title}
        </h1>

        <p className="project-description">
          {project.description}
        </p>

      </section>


      {/* PROJECT INFO */}

      <section className="project-meta">

        <div>
          <span>Client</span>
          <strong>{project.client}</strong>
        </div>

        <div>
          <span>Role</span>
          <strong>{project.role}</strong>
        </div>

        <div>
          <span>Year</span>
          <strong>{project.year}</strong>
        </div>

      </section>


{/* MAIN VISUAL */}

<section className="project-main-visual">

  {/* VIDEO */}

  {project.media.video && (

    <section className="project-video-section">

      <div className="project-gallery-header">

        <p className="section-label">
          MAIN VIDEO
        </p>

      </div>

      <video
        className="project-main-video"
        src={project.media.video}
        controls
        playsInline
        preload="metadata"
      />

    </section>

  )}


  {/* HERO IMAGE - fallback when there is no video */}

  {!project.media.video && project.media.hero && (

    <section className="project-hero-section">

      <div className="project-gallery-header">

        <p className="section-label">
          MAIN IMAGE
        </p>

      </div>

      <img
        className="project-main-image"
        src={project.media.hero}
        alt={project.title}
      />

    </section>

  )}


  {/* SELECTED IMAGES */}

  {project.media.gallery?.length > 0 && (

    <section className="project-gallery">

      <div className="project-gallery-header">

        <p className="section-label">
          SELECTED IMAGES
        </p>

        <span>
          {project.media.gallery.length} images
        </span>

      </div>


      {/* GALLERY GRID */}

      <div className="project-gallery-grid">

        {project.media.gallery.map((image, index) => (

          <div
            className={
              index === 0 || index === 3
                ? "gallery-item gallery-item-large"
                : "gallery-item"
            }
            key={image}
          >

            <button
              type="button"
              className="gallery-lightbox-trigger"
              onClick={() => setLightboxIndex(index)}
            >

              <img
                src={image}
                alt={`${project.title} — ${index + 1}`}
                loading="lazy"
              />

            </button>

          </div>

        ))}

      </div>

    </section>

  )}

</section>

      {/* =========================
          LIGHTBOX
          ========================= */}

      {lightboxIndex !== null && (

        <div
          className="lightbox"
          onClick={() => {
            if (!isDragging && !isAnimating) {
              setLightboxIndex(null);
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >

          {/* CLOSE */}

          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
          >
            ×
          </button>


          {/* PREVIOUS */}

          <button
            type="button"
            className="lightbox-arrow lightbox-prev"
            onClick={(e) => {

              e.stopPropagation();

              if (isAnimating) return;

              setLightboxIndex((current) =>
                current === 0
                  ? project.media.gallery.length - 1
                  : current - 1
              );

            }}
            aria-label="Previous image"
          >
            ‹
          </button>


          {/* IMAGE */}

          <img
            src={project.media.gallery[lightboxIndex]}
            alt={`${project.title} — ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            draggable="false"
            style={{
              transform: `translateX(${dragX}px)`,

              transition:
                isDragging || isAnimating
                  ? "none"
                  : "transform 0.3s ease-out",

              touchAction: "pan-y",

              userSelect: "none",

              WebkitUserDrag: "none",
            }}
          />


          {/* COUNTER */}

          <div className="lightbox-counter">
            {lightboxIndex + 1} / {project.media.gallery.length}
          </div>


          {/* NEXT */}

          <button
            type="button"
            className="lightbox-arrow lightbox-next"
            onClick={(e) => {

              e.stopPropagation();

              if (isAnimating) return;

              setLightboxIndex((current) =>
                current === project.media.gallery.length - 1
                  ? 0
                  : current + 1
              );

            }}
            aria-label="Next image"
          >
            ›
          </button>

        </div>

      )}


      {/* SERVICES / SOFTWARE */}

      <section className="project-details">

        <div className="project-detail-column">

          <p className="section-label">
            SERVICES
          </p>

          <ul>

            {project.services.map((service) => (

              <li key={service}>
                {service}
              </li>

            ))}

          </ul>

        </div>


        <div className="project-detail-column">

          <p className="section-label">
            SOFTWARE
          </p>

          <ul>

            {project.software.map((software) => (

              <li key={software}>
                {software}
              </li>

            ))}

          </ul>

        </div>

      </section>


      {/* CASE STUDY */}

      <section className="case-study">

        <div className="case-study-block">

          <p className="section-label">
            THE CHALLENGE
          </p>

          <h2>
            {project.caseStudy.challenge}
          </h2>

        </div>


        <div className="case-study-block">

          <p className="section-label">
            THE SOLUTION
          </p>

          <h2>
            {project.caseStudy.solution}
          </h2>

        </div>


        <div className="case-study-block">

          <p className="section-label">
            THE RESULT
          </p>

          <h2>
            {project.caseStudy.result}
          </h2>

        </div>

      </section>


      {/* TAGS */}

      <section className="project-tags">

        <p className="section-label">
          TAGS
        </p>

        <div className="tags-list">

          {project.tags.map((tag) => (

            <span key={tag}>
              {tag}
            </span>

          ))}

        </div>

      </section>


      {/* BACK */}

      <div className="project-back">

        <Link to="/work">
          ← Back to all projects
        </Link>

      </div>

    </main>
  );
}

export default Project;