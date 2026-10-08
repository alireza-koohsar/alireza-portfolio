import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import BackToTop from "./components/BackToTop";
import Home from "./pages/Home";
import Project from "./pages/Project";
import Work from "./pages/Work";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Resume from "./pages/Resume";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:projectId" element={<Project />} />
          <Route path="/about" element={<About />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
      <BackToTop />
    </BrowserRouter>
  );
}

export default App;