import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import pdf from "../../Assets/Jaydip_Vasoya_Resume.pdf";
import { AiOutlineDownload } from "react-icons/ai";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function ResumeNew() {
  const [width, setWidth] = useState(1200);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const pageWidth = Math.min(width - 32, 900);

  return (
    <main className="resume-section">
      <Container>
        <div className="resume-head">
          <div>
            <p className="section-label">Resume</p>
            <h1 className="section-title">Jaydip Vasoya</h1>
          </div>
          <a className="btn-accent" href={pdf} download="Jaydip_Vasoya_Resume.pdf">
            <AiOutlineDownload /> Download PDF
          </a>
        </div>

        <Document
          file={pdf}
          className="resume-doc"
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<p className="muted">Loading resume…</p>}
        >
          {Array.from({ length: numPages || 0 }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={pageWidth}
              renderTextLayer={false}
              className="resume-page"
            />
          ))}
        </Document>
      </Container>
    </main>
  );
}

export default ResumeNew;
