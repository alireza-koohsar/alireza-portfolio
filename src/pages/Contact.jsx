import { useState } from "react";

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="contact-page">

      <section className="contact-hero">

        <div className="contact-hero-label">
          CONTACT
        </div>

        <div className="contact-hero-content">

          <h1>
            Let’s create
            <br />
            something meaningful.
          </h1>

          <p className="contact-intro">
            Have a project in mind, need help with a visual idea,
            or looking for a creative partner? I’d love to hear
            what you’re working on.
          </p>

        </div>

      </section>

      <section className="contact-main">

        <div className="contact-info">

          <div className="contact-section-label">
            GET IN TOUCH
          </div>

          <div className="contact-info-content">

            <p className="contact-lead">
              Tell me a little about your project,
              and let’s see how I can help.
            </p>

            <div className="contact-links">

              <a href="mailto:ar.koohsar@gmail.com">
                <span>Email</span>
                <strong>ar.koohsar@gmail.com</strong>
              </a>

              <a
                href="https://www.linkedin.com/in/alireza-koohsar/"
                target="_blank"
                rel="noreferrer"
              >
                <span>LinkedIn</span>
                <strong>linkedin.com/in/alireza-koohsar</strong>
              </a>

              <a
                href="https://www.behance.net/alirezakoohsar"
                target="_blank"
                rel="noreferrer"
              >
                <span>Behance</span>
                <strong>behance.net/alirezakoohsar</strong>
              </a>

              <a
                href="https://vimeo.com/alirezakoohsar"
                target="_blank"
                rel="noreferrer"
              >
                <span>Vimeo</span>
                <strong>vimeo.com/alirezakoohsar</strong>
              </a>

            </div>

          </div>

        </div>

        <div className="contact-form-wrapper">

          <div className="contact-section-label">
            START A CONVERSATION
          </div>

          <div className="contact-form-intro">

            <h2>
              Have a project
              <br />
              in mind?
            </h2>

            <p>
              Whether you need motion design, graphic design,
              visual communication or creative production,
              share some details below.
            </p>

          </div>

          {submitted ? (

            <div className="contact-success">

              <span className="contact-success-icon">
                ✓
              </span>

              <h3>
                Thanks for reaching out.
              </h3>

              <p>
                Your message has been received.
                I’ll get back to you as soon as possible.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="contact-reset"
              >
                Send another message →
              </button>

            </div>

          ) : (

            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >

              <div className="contact-form-row">

                <div className="contact-field">

                  <label htmlFor="name">
                    Your Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Smith"
                    required
                  />

                </div>

                <div className="contact-field">

                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />

                </div>

              </div>

              <div className="contact-field">

                <label htmlFor="company">
                  Company / Organization
                  <span>Optional</span>
                </label>

                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Company name"
                />

              </div>

              <div className="contact-field">

                <label htmlFor="service">
                  What can I help you with?
                </label>

                <select
                  id="service"
                  name="service"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select a service
                  </option>

                  <option value="motion-design">
                    Motion Design
                  </option>

                  <option value="graphic-design">
                    Graphic Design
                  </option>

                  <option value="visual-communication">
                    Visual Communication
                  </option>

                  <option value="creative-production">
                    Creative Production
                  </option>

                  <option value="creative-direction">
                    Creative Direction
                  </option>

                  <option value="consultation">
                    Design Consultation
                  </option>

                  <option value="other">
                    Something else
                  </option>

                </select>

              </div>

              <div className="contact-field">

                <label htmlFor="message">
                  Tell me about your project
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows="7"
                  placeholder="Tell me about your project, goals, timeline, or anything else that might be useful..."
                  required
                />

              </div>

              <div className="contact-form-footer">

                <p>
                  I usually respond within a few business days.
                </p>

                <button
                  type="submit"
                  className="contact-submit"
                >
                  Send Inquiry
                  <span>→</span>
                </button>

              </div>

            </form>

          )}

        </div>

      </section>

      <section className="contact-cta">

        <div>

          <p className="section-label">
            NEED CREATIVE GUIDANCE?
          </p>

          <h2>
            Have an idea but
            <br />
            not sure where to start?
          </h2>

          <p className="contact-cta-text">
            I also work with clients who need help defining
            the visual direction, communication strategy or
            creative approach before production begins.
          </p>

        </div>

        <a
          href="mailto:ar.koohsar@gmail.com?subject=Design Consultation"
          className="hero-button"
        >
          Discuss a Project →
        </a>

      </section>

    </main>
  );
}

export default Contact;