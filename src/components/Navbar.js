import React, { useEffect, useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { Link, useLocation, useNavigate } from "react-router-dom";

const sections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

function NavBar() {
  const [expand, updateExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function goTo(e, id) {
    e.preventDefault();
    updateExpanded(false);
    if (pathname === "/") {
      document.getElementById(id).scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  }

  return (
    <Navbar
      expanded={expand}
      fixed="top"
      expand="md"
      variant="dark"
      className={scrolled || expand ? "site-nav scrolled" : "site-nav"}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand" onClick={() => updateExpanded(false)}>
          JV<span>.</span>
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="site-nav"
          onClick={() => updateExpanded(expand ? false : "expanded")}
        />
        <Navbar.Collapse id="site-nav">
          <Nav className="ms-auto align-items-md-center">
            {sections.map((s) => (
              <Nav.Link key={s.id} href={`/#${s.id}`} onClick={(e) => goTo(e, s.id)}>
                {s.label}
              </Nav.Link>
            ))}
            <Nav.Link
              as={Link}
              to="/resume"
              className="nav-cta"
              onClick={() => updateExpanded(false)}
            >
              Resume
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
