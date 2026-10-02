import React from "react";
import { Container } from "react-bootstrap";
import { AiFillGithub, AiOutlineMail } from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { ImBlog } from "react-icons/im";
import { profile } from "../data/portfolio";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <Container className="footer-inner">
        <p>© {year} {profile.name}. Built with React.</p>
        <ul className="footer-icons">
          <li>
            <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <AiFillGithub />
            </a>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </li>
          <li>
            <a href={profile.blog} target="_blank" rel="noreferrer" aria-label="Blog">
              <ImBlog />
            </a>
          </li>
          <li>
            <a href={`mailto:${profile.email}`} aria-label="Email">
              <AiOutlineMail />
            </a>
          </li>
        </ul>
      </Container>
    </footer>
  );
}

export default Footer;
