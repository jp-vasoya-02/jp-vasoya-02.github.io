// Build-time SEO: crawlable HTML in #root, JSON-LD, sitemap.xml and llms.txt,
// all generated from src/data/portfolio.js so content and metadata never drift.
import {
  profile,
  experience,
  projects,
  additionalProjects,
  skills,
  education,
  faq,
} from "../src/data/portfolio.js";

const SITE = "https://jp-vasoya-02.github.io/";
const HEADLINE = "I build AI agents that run on real-time market data.";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const abs = (path) => new URL(path, SITE).href;

// Static, semantic copy of the page. React's createRoot replaces it on load.
function staticHtml() {
  const list = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  return `
<div class="prerender">
  <header class="container">
    <h1>${esc(HEADLINE)}</h1>
    <p>${esc(profile.name)} · ${esc(profile.title)} · ${esc(profile.location)}</p>
    <p>${esc(profile.summary)}</p>
    <p><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a> · <a href="${esc(profile.github)}">GitHub</a> · <a href="${esc(profile.linkedin)}">LinkedIn</a> · <a href="${esc(profile.resume)}">Resume (PDF)</a></p>
  </header>
  <section class="container" id="experience-static"><h2>Experience</h2>
    ${experience
      .map(
        (j) => `<article><h3>${esc(j.role)}, ${esc(j.company)}</h3><p>${esc(j.period)}${j.location ? ` · ${esc(j.location)}` : ""}</p>${list(j.points)}</article>`
      )
      .join("")}
  </section>
  <section class="container" id="projects-static"><h2>Projects</h2>
    ${projects
      .map(
        (p) => `<article><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${list(p.points)}<p>Tech: ${esc(p.tech.join(", "))}</p></article>`
      )
      .join("")}
    ${additionalProjects.map((p) => `<article><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></article>`).join("")}
  </section>
  <section class="container" id="skills-static"><h2>Skills</h2>
    ${skills.map((g) => `<h3>${esc(g.group)}</h3><p>${esc(g.items.join(", "))}</p>`).join("")}
  </section>
  <section class="container" id="education-static"><h2>Education</h2>
    ${education.map((e) => `<p><strong>${esc(e.degree)}</strong>, ${esc(e.school)} (${esc(e.period)})${e.note ? ` · ${esc(e.note)}` : ""}</p>`).join("")}
  </section>
  <section class="container" id="faq-static"><h2>FAQ</h2>
    ${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}
  </section>
</div>`;
}

function jsonLd() {
  const personId = `${SITE}#person`;
  const schools = education.map((e) => ({
    "@type": "CollegeOrUniversity",
    name: e.school.split(",")[0].replace(/\s*\(.*\)$/, "").trim(),
  }));
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${SITE}#website`,
      url: SITE,
      name: `${profile.name} | Portfolio`,
      inLanguage: "en",
      publisher: { "@id": personId },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE}#profile`,
      url: SITE,
      name: `${profile.name} | ${profile.title}`,
      isPartOf: { "@id": `${SITE}#website` },
      mainEntity: { "@id": personId },
      dateModified: new Date().toISOString().slice(0, 10),
    },
    {
      "@type": "Person",
      "@id": personId,
      name: profile.name,
      url: SITE,
      image: abs("og.png"),
      email: `mailto:${profile.email}`,
      jobTitle: profile.title,
      description: profile.summary,
      address: { "@type": "PostalAddress", addressLocality: "Ahmedabad", addressCountry: "IN" },
      alumniOf: schools,
      hasOccupation: {
        "@type": "Occupation",
        name: profile.title,
        occupationLocation: { "@type": "Country", name: "India" },
        skills: skills.flatMap((g) => g.items).join(", "),
      },
      knowsAbout: [...new Set(skills.flatMap((g) => g.items))],
      sameAs: [profile.github, profile.linkedin, profile.blog],
    },
    {
      "@type": "ItemList",
      "@id": `${SITE}#projects`,
      name: "Selected projects",
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: p.title,
          description: p.description,
          keywords: p.tech.join(", "),
          creator: { "@id": personId },
        },
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}#faq`,
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  // Escape "<" so the JSON can never close the script tag.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: SITE, priority: "1.0" },
    { loc: abs(profile.resume), priority: "0.6" },
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
}

function llmsTxt() {
  return `# ${profile.name}

> ${profile.title} (${profile.tagline}), based in ${profile.location}. ${profile.summary}

## Contact
- Email: ${profile.email}
- GitHub: ${profile.github}
- LinkedIn: ${profile.linkedin}
- Resume (PDF): ${abs(profile.resume)}
- Portfolio: ${SITE}

## Experience
${experience.map((j) => `- ${j.role}, ${j.company} (${j.period}): ${j.points[0]}`).join("\n")}

## Key projects
${projects.map((p) => `- ${p.title}: ${p.description} Stack: ${p.tech.join(", ")}.`).join("\n")}

## Skills
${skills.map((g) => `- ${g.group}: ${g.items.join(", ")}`).join("\n")}

## Education
${education.map((e) => `- ${e.degree}, ${e.school} (${e.period})${e.note ? `, ${e.note}` : ""}`).join("\n")}

## FAQ
${faq.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}
`;
}

export default function seoPlugin() {
  return {
    name: "portfolio-seo",
    transformIndexHtml(html) {
      return html
        .replace('<div id="root"></div>', `<div id="root">${staticHtml()}</div>`)
        .replace("</head>", `  <script type="application/ld+json">${jsonLd()}</script>\n</head>`);
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap() });
      this.emitFile({ type: "asset", fileName: "llms.txt", source: llmsTxt() });
    },
  };
}
