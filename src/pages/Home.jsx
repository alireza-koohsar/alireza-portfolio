import { useRef } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import projects from "../data/projects";

function Home() {
  const showcaseRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const handlePointerDown = (event) => {
    const slider = showcaseRef.current;

    if (!slider) return;

    isDragging.current = true;
    startX.current = event.clientX;
    startScrollLeft.current = slider.scrollLeft;

    slider.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging.current) return;

    const slider = showcaseRef.current;

    if (!slider) return;

    const distance = event.clientX - startX.current;

    slider.scrollLeft =
      startScrollLeft.current - distance;
  };

  const handlePointerUp = (event) => {
    const slider = showcaseRef.current;

    if (!slider) return;

    isDragging.current = false;

    if (slider.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <main className="home">

      {/* HERO */}
      <section className="hero">

        <div className="hero-content">

          <p className="hero-label">
            SENIOR GRAPHIC & MOTION DESIGNER
          </p>

          <h1>
            Alireza
            <br />
            Koohsar
          </h1>

          <p className="hero-description">
            10+ years of experience turning ideas, products and
            complex information into clear, engaging visual
            experiences.
          </p>

          <p className="hero-subdescription">
            I work across motion graphics, visual communication,
            digital content and creative production.
          </p>

          <div className="hero-actions">

            <a className="hero-button" href="/work">
              View My Work →
            </a>

            <a className="hero-link" href="/contact">
              Get in Touch →
            </a>

          </div>

        </div>


        <div className="hero-visual">

          <div className="hero-art">

            <div className="hero-art-grid"></div>

            <div className="hero-art-text">
              AK
            </div>

            <div className="hero-art-circle"></div>

            <div className="hero-art-line"></div>

            <div className="hero-art-label">
              DESIGN / MOTION
            </div>

            <div className="hero-art-year">
              10+
            </div>

          </div>

        </div>

      </section>
{/* SHOWREEL */}

<section className="showreel">

  <div className="showreel-video">

    <video
      src="/videos/showreel.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />

    <div className="showreel-overlay">

      <div className="showreel-overlay-left">

        <span className="showreel-kicker">
          SHOWREEL / 2026
        </span>

        <h2>
          Motion, design & visual storytelling.
        </h2>

      </div>

      <span className="showreel-number">
        01
      </span>

    </div>

  </div>

</section>

{/* SERVICES MARQUEE */}

<section className="services-marquee">

  <div className="services-track">

    <div className="services-group">

      <span>Motion Design</span>
      <i>✦</i>

      <span>Graphic Design</span>
      <i>✦</i>

      <span>Visual Communication</span>
      <i>✦</i>

      <span>Creative Production</span>
      <i>✦</i>

    </div>

    <div className="services-group" aria-hidden="true">

      <span>Motion Design</span>
      <i>✦</i>

      <span>Graphic Design</span>
      <i>✦</i>

      <span>Visual Communication</span>
      <i>✦</i>

      <span>Creative Production</span>
      <i>✦</i>

    </div>
    
        <div className="services-group" aria-hidden="true">

      <span>Motion Design</span>
      <i>✦</i>

      <span>Graphic Design</span>
      <i>✦</i>

      <span>Visual Communication</span>
      <i>✦</i>

      <span>Creative Production</span>
      <i>✦</i>

    </div>

    <div className="services-group" aria-hidden="true">

      <span>Motion Design</span>
      <i>✦</i>

      <span>Graphic Design</span>
      <i>✦</i>

      <span>Visual Communication</span>
      <i>✦</i>

      <span>Creative Production</span>
      <i>✦</i>

    </div>

  </div>

</section>


      {/* SELECTED WORK */}

      <section className="selected-work">

        <div className="section-header">

          <div>
            <p className="section-label">
              SELECTED WORK
            </p>

            <h2>
              A selection of projects
            </h2>
          </div>

          <a href="/work" className="section-link">
            View all work →
          </a>

        </div>


        <div className="projects-grid">

          {projects.slice(0, 4).map((project) => (
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

      </section>

{/* PROJECT SHOWCASE */}

<section className="project-showcase">

  <div className="showcase-header">

    <div>
      <p className="section-label">
        PROJECTS / 04
      </p>

      <h2>
        Selected visual stories.
      </h2>
    </div>

    <span className="showcase-hint">
      SCROLL TO EXPLORE →
    </span>

  </div>

<div
  ref={showcaseRef}
  className="showcase-track"
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onPointerCancel={handlePointerUp}
>

    {projects.slice(0, 4).map((project) => (
      <a
        key={project.id}
        href={`/work/${project.id}`}
        className="showcase-item"
      >

        <div className="showcase-image">

          {project.media.video ? (
            <video
              src={project.media.video}
              poster={project.media.cover}
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={project.media.cover}
              alt={project.title}
            />
          )}

          <span className="showcase-number">
            {String(projects.indexOf(project) + 1).padStart(2, "0")}
          </span>

        </div>

        <div className="showcase-info">

          <div>
            <h3>
              {project.title}
            </h3>

            <p>
              {project.category}
            </p>
          </div>

          <span>
            {project.year}
          </span>

        </div>

      </a>
    ))}

  </div>

</section>

{/* SELECTED CLIENTS */}

<section className="selected-clients">

  <div className="clients-header">

    <div>
      <p className="section-label">
        SELECTED CLIENTS
      </p>

      <h2>
        Working across industries.
      </h2>
    </div>

    <p className="clients-description">
      Brands, companies and teams I’ve worked with
      across design, motion and visual communication.
    </p>

  </div>

  <div className="clients-list">

    <div className="client-item">

      <div className="client-logo">
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <circle
            cx="40"
            cy="40"
            r="27"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M25 40h30M40 25v30"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      </div>

      <strong>UNILEVER</strong>

    </div>


    <div className="client-item">

      <div className="client-logo">
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <rect
            x="18"
            y="18"
            width="44"
            height="44"
            rx="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle
            cx="40"
            cy="40"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      </div>

      <strong>KESHMOON</strong>

    </div>


    <div className="client-item">

      <div className="client-logo">
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <path
            d="M18 55 40 18l22 37H18Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M29 55h22"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      </div>

      <strong>FARAZ</strong>

    </div>


    <div className="client-item">

      <div className="client-logo">
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <path
            d="M20 20h40v40H20z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M28 52 40 28l12 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      </div>

      <strong>KARA</strong>

    </div>


    <div className="client-item">

      <div className="client-logo">
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <circle
            cx="40"
            cy="40"
            r="27"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M29 44c4-11 18-11 22 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="31"
            cy="32"
            r="3"
            fill="currentColor"
          />
          <circle
            cx="49"
            cy="32"
            r="3"
            fill="currentColor"
          />
        </svg>
      </div>

      <strong>TIMECHAIN</strong>

    </div>

  </div>

</section>

{/* CREATIVE APPROACH */}

<section className="creative-approach">

  <div className="approach-header">

    <div>
      <p className="section-label">
        CREATIVE APPROACH
      </p>

      <h2>
        From idea to impact.
      </h2>
    </div>

    <p className="approach-intro">
      I combine strategic thinking, visual design and motion
      to turn complex ideas into clear and engaging experiences.
    </p>

  </div>


  <div className="approach-grid">

    <article className="approach-item">

      <span className="approach-number">
        01
      </span>

      <div className="approach-icon">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle
            cx="24"
            cy="24"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M18 25c3-8 9-8 12 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="19"
            cy="20"
            r="2"
            fill="currentColor"
          />
          <circle
            cx="29"
            cy="20"
            r="2"
            fill="currentColor"
          />
        </svg>
      </div>

      <h3>
        THINK
      </h3>

      <p>
        Understand the idea, the audience and the problem
        before jumping into execution.
      </p>

    </article>


    <article className="approach-item">

      <span className="approach-number">
        02
      </span>

      <div className="approach-icon">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M14 34 34 14"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M19 14h15v15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M14 39h20"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <h3>
        DESIGN
      </h3>

      <p>
        Build a clear visual language that connects ideas,
        information and brand identity.
      </p>

    </article>


    <article className="approach-item">

      <span className="approach-number">
        03
      </span>

      <div className="approach-icon">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M12 24h22"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="m28 17 7 7-7 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="12"
            cy="24"
            r="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <h3>
        MOVE
      </h3>

      <p>
        Bring the visual language to life through motion,
        animation and purposeful storytelling.
      </p>

    </article>

  </div>

</section>
{/* FINAL CTA */}

<section className="home-final-cta">

  <div className="home-final-cta-content">

    <p className="section-label">
      LET’S WORK TOGETHER
    </p>

    <h2>
      Have an idea?
      <br />
      Let’s make it move.
    </h2>

    <p className="home-final-cta-text">
      Whether you’re building a brand, launching a product or
      communicating something complex, I can help turn the idea
      into a clear and engaging visual experience.
    </p>

  </div>

  <div className="home-final-cta-action">

    <Link
      to="/contact"
      className="hero-button"
    >
      Start a Conversation →
    </Link>

    <a
      href="mailto:ar.koohsar@gmail.com"
      className="home-final-cta-email"
    >
      ar.koohsar@gmail.com
    </a>

  </div>

</section>
    </main>
  );
}

export default Home;