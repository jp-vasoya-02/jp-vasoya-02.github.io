import React from "react";
import { Col, Row } from "react-bootstrap";
import { FaAws } from 'react-icons/fa';
import {
  DiJavascript1,
  DiReact,
  DiNodejs,
  DiPython,
  DiGit,
} from "react-icons/di";
import {
  SiNextdotjs,
  SiDjango,
  SiC,
  SiTypescript,
  SiHtml5,
  SiCss3,
  SiPostgresql,
  SiAmazondynamodb,
  SiGraphql,
  SiRedux,
  SiMysql
} from "react-icons/si";

function Techstack() {
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
      {/* <Col xs={4} md={2} className="tech-icons">
        <CgCPlusPlus />
      </Col> */}
      <Col xs={4} md={2} className="tech-icons" title="Python">
        <DiPython />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Javascript">
        <DiJavascript1 />
      </Col>

      <Col xs={4} md={2} className="tech-icons" title="ReactJs & React Native">
        <DiReact />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Django">
        <SiDjango />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="NextJS">
        <SiNextdotjs />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Git & Github">
        <DiGit />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="C Programming">
        <SiC />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Amazone Web Services">
        <FaAws />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="TypeScript">
        <SiTypescript />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="NodeJS">
        <DiNodejs />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="HTML">
        <SiHtml5 />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="CSS">
        <SiCss3 />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Postgresql">
        <SiPostgresql />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="DynamoDB">
        <SiAmazondynamodb />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="MY SQL">
        <SiMysql />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Graphql">
        <SiGraphql />
      </Col>
      <Col xs={4} md={2} className="tech-icons" title="Redux">
        <SiRedux />
      </Col>
     

      {/* <Col xs={4} md={2} className="tech-icons">
        <DiMongodb />
      </Col> */}

      {/* <Col xs={4} md={2} className="tech-icons">
        <SiFirebase />
      </Col> */}

      {/* <Col xs={4} md={2} className="tech-icons">
        <SiPytorch />
      </Col> */}
    </Row>
  );
}

export default Techstack;
