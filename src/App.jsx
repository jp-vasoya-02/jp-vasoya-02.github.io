import { useEffect } from "react";
import Background from "./components/Background";
import Nav from "./components/Nav";
import ScrollProgress from "./components/ScrollProgress";
import CommandPalette from "./components/CommandPalette";
import Toast from "./components/Toast";
import Footer from "./components/Footer";
import Hero from "./components/hero/Hero";
import AgentTerminal from "./components/terminal/AgentTerminal";
import About from "./components/sections/About";
import Experience from "./components/sections/Experience";
import Projects from "./components/sections/Projects";
import Skills from "./components/sections/Skills";
import Education from "./components/sections/Education";
import Contact from "./components/sections/Contact";
import { initSmoothScroll } from "./lib/scroll";

export default function App() {
  useEffect(() => initSmoothScroll(), []);

  return (
    <>
      <Background />
      <ScrollProgress />
      <Nav />
      <main id="top">
        <Hero />
        <AgentTerminal />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
      <CommandPalette />
      <Toast />
    </>
  );
}
