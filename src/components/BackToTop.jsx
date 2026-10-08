import { useEffect, useState } from "react";

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const scrollProgress =
        documentHeight > 0
          ? (scrollTop / documentHeight) * 100
          : 0;

      setProgress(scrollProgress);
      setVisible(scrollTop > 300);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      className={`back-to-top ${visible ? "is-visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{
        "--scroll-progress": `${progress}%`,
      }}
    >
      <span className="back-to-top-arrow">↑</span>
    </button>
  );
}

export default BackToTop;