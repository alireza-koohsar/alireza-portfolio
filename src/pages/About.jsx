import { Link } from "react-router-dom";

function About() {
  return (
    <main className="about-page">

      {/* HERO */}
      <section className="about-hero">

        <div className="about-hero-label">
          ABOUT
        </div>

        <div className="about-hero-content">

          <h1>
            A designer who
            <br />
            thinks in motion.
          </h1>

<p className="about-intro">
  I’m Alireza Koohsar, a Senior Graphic & Motion Designer
  with more than 10 years of professional experience
  across visual communication, branding, motion design
  and creative production.
</p>

<Link
  to="/resume"
  className="about-resume-link"
>
  View My Resume <span>↗</span>
</Link>

        </div>

      </section>


      {/* PROFILE */}
      <section className="about-section about-profile">

        <div className="about-section-label">
          PROFILE
        </div>

        <div className="about-section-content">

          <p className="about-lead">
            I turn ideas, products and complex information into
            clear, engaging visual experiences.
          </p>

          <p>
            My experience spans technology, telecommunications,
            blockchain and fintech, e-commerce, consumer products,
            marketing and advertising. I’ve worked across corporate
            environments, startups, creative studios and international
            remote teams.
          </p>

          <p>
            My work combines graphic design, motion graphics,
            visual storytelling and marketing thinking — allowing
            me to approach projects not only from a visual
            perspective, but also from a communication and
            business point of view.
          </p>

        </div>

      </section>


{/* WORK CTA */}
<section className="about-work-cta">

  <div>
    <p className="section-label">
      SELECTED WORK
    </p>

    <h2>
      See what I’ve been creating.
    </h2>
  </div>

  <Link
    to="/work"
    className="hero-button"
  >
    View My Work →
  </Link>

</section>


{/* WHAT I DO */}
<section className="about-section">

  <div className="about-section-label">
    WHAT I DO
  </div>

        <div className="about-services">

          <div className="about-service">
            <span>01</span>
            <h2>Motion Design</h2>
            <p>
              Motion graphics, explainer videos, promotional content,
              animation and visual effects designed to make ideas move.
            </p>
          </div>

          <div className="about-service">
            <span>02</span>
            <h2>Graphic Design</h2>
            <p>
              Brand identities, campaigns, social content,
              presentations, catalogs, print materials and
              corporate communication.
            </p>
          </div>

          <div className="about-service">
            <span>03</span>
            <h2>Visual Communication</h2>
            <p>
              Turning complex products, technologies and ideas
              into clear and engaging visual narratives.
            </p>
          </div>

          <div className="about-service">
            <span>04</span>
            <h2>Creative Production</h2>
            <p>
              From concept and visual direction to design,
              animation, production and final delivery.
            </p>
          </div>

        </div>

      </section>


      {/* EXPERIENCE */}
      <section className="about-section">

        <div className="about-section-label">
          EXPERIENCE
        </div>

        <div className="about-section-content">

          <h2>
            More than a decade of creative experience.
          </h2>

          <p>
            I started my professional journey in graphic design
            and advertising, later expanding into motion design,
            multimedia production, marketing and creative direction.
          </p>

          <p>
            Over the years, I’ve worked with companies and teams
            across different industries and scales — from local
            businesses and creative studios to technology companies,
            blockchain startups and corporate environments.
          </p>

          <p>
            This variety has taught me how to adapt visual thinking
            to different audiences, products, communication goals
            and production environments.
          </p>

        </div>

      </section>


      {/* INDUSTRIES */}
      <section className="about-section">

        <div className="about-section-label">
          INDUSTRIES
        </div>

        <div className="about-industries">

          <span>Technology</span>
          <span>Telecommunications</span>
          <span>Blockchain & Fintech</span>
          <span>E-commerce</span>
          <span>Consumer Goods</span>
          <span>Marketing & Advertising</span>
          <span>Corporate Communications</span>

        </div>

      </section>


      {/* TOOLS */}
      <section className="about-section">

        <div className="about-section-label">
          TOOLS
        </div>

        <div className="about-tools">

          <span>After Effects</span>
          <span>Illustrator</span>
          <span>Photoshop</span>
          <span>Premiere Pro</span>
          <span>InDesign</span>
          <span>Figma</span>
          <span>Blender</span>
          <span>Generative AI</span>

        </div>

      </section>


      {/* APPROACH */}
      <section className="about-section about-approach">

        <div className="about-section-label">
          APPROACH
        </div>

        <div className="about-section-content">

          <h2>
            Design meets technology.
          </h2>

          <p>
            I use modern creative tools and generative AI to
            accelerate exploration, production and iteration —
            while keeping creative direction, visual thinking
            and storytelling at the center of the process.
          </p>

          <p className="about-quote">
            Technology helps me move faster.
            <br />
            Design makes the work matter.
          </p>

        </div>

      </section>


      {/* CTA */}
      <section className="about-cta">

        <p className="section-label">
          WANT TO KNOW MORE?
        </p>

        <h2>
          Explore my experience.
        </h2>

        <Link
          to="/resume"
          className="hero-button"
        >
          View My Resume →
        </Link>

      </section>

    </main>
  );
}

export default About;