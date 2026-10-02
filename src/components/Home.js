import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Experience from "./sections/Experience";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import Education from "./sections/Education";
import Contact from "./sections/Contact";

function Home() {
  const { state } = useLocation();

  // Navbar links from other routes pass the target section in router state.
  useEffect(() => {
    if (state && state.scrollTo) {
      const el = document.getElementById(state.scrollTo);
      if (el) el.scrollIntoView();
    }
  }, [state]);

  return (
    <main>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Education />
      <Contact />
    </main>
  );
}

export default Home;
