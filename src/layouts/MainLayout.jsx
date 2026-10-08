import { Link, Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="site">

      <header className="site-header">
        <nav className="nav">

          <Link className="logo" to="/">
            Alireza Koohsar
          </Link>

          <div className="nav-links">
            <Link to="/work">Work</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>

        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>© 2026 Alireza Koohsar</p>
      </footer>

    </div>
  );
}

export default MainLayout;