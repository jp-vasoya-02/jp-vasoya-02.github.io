import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  SiLinux,
  SiVisualstudiocode,
  SiVite,
  SiPostman,
} from "react-icons/si";
import { FaUbuntu,FaChrome,FaDocker,FaGithub } from 'react-icons/fa';

function Toolstack() {
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
      <Col xs={4} md={2} className="tech-icons" title="Linux kernel">
        <SiLinux />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Visual studio code">
        <SiVisualstudiocode />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Postman">
        <SiPostman />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Ubuntu OS">
        <FaUbuntu />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Chrome Extensions">
        <FaChrome />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Docker">
        <FaDocker />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Vite JS">
        <SiVite />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Github">
        <FaGithub />
      </Col>
      
      {/* <Col xs={4} md={2} className="tech-icons">
        <SiVercel />
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiHeroku />
      </Col> */}
    </Row>
  );
}

export default Toolstack;
