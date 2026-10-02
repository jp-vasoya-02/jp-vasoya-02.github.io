// Scripted "agent" for the Ask-my-agent terminal.
// Maps a command (or a loose natural-language question) to a response made of
// tool calls + content blocks. All content is derived from src/data/portfolio.js.
//
// Response shape:
//   { kind: "answer", tools: [{ name, args, result }], blocks: Block[] }
//   { kind: "clear" }
//
// Block types:
//   { type: "p", text }                     inline `code` and **bold** supported
//   { type: "list", items: string[], ordered? }
//   { type: "table", head: string[], rows: string[][] }
//   { type: "code", text }                  single mono line (e.g. an architecture flow)
//   { type: "tags", items: string[] }
//   { type: "links", items: [{ label, href, icon }] }
//   { type: "actions", items: [{ label, action, target?, icon, primary? }] }
//   { type: "note", text }                  small muted footnote

import {
  profile,
  stats,
  experience,
  projects,
  skills,
  education,
  terminalPrompts,
} from "../../data/portfolio";
import { navSections } from "../../lib/actions";

export const AGENT_TITLE = "jaydip-agent · scripted demo · no LLM calls";

export const GREETING =
  "Hi, I'm Jaydip's portfolio agent. Ask me about his work. Try a suggestion below or type `help`.";

export const SUGGESTIONS = [...new Set([...terminalPrompts, "help"])];

const firstName = profile.name.split(" ")[0];
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const handle = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const DEMO_NOTE = "This is a scripted demo agent. No LLM calls, and no data leaves your browser.";

const COMMANDS = [
  ["whoami", "who Jaydip is, in one screen"],
  ["projects", "the four flagship products"],
  ["project <n|id>", "deep dive, e.g. `project 1` or `project opra-pipeline`"],
  ["ai", "agents, LLM tooling and AI projects"],
  ["stack", "skills grouped by category (alias: `skills`)"],
  ["experience", "roles and highlights"],
  ["education", "degrees"],
  ["hire", "contact details and next steps (alias: `contact`)"],
  ["resume", "open the PDF resume"],
  ["ls", "list the sections of this site"],
  ["clear", "clear the console"],
];

// ---------- shared block builders ----------

const contactLinks = () => ({
  type: "links",
  items: [
    { label: profile.email, href: `mailto:${profile.email}`, icon: "mail" },
    { label: handle(profile.github), href: profile.github, icon: "github" },
    { label: handle(profile.linkedin), href: profile.linkedin, icon: "linkedin" },
  ],
});

const contactActions = () => ({
  type: "actions",
  items: [
    { label: "Copy email", action: "copyEmail", icon: "copy", primary: true },
    { label: "Open resume", action: "openResume", icon: "file" },
    { label: "Contact section", action: "scroll", target: "contact", icon: "arrow" },
  ],
});

const caseStudyAction = (label = "See case study") => ({
  type: "actions",
  items: [{ label, action: "scroll", target: "projects", icon: "arrow", primary: true }],
});

const summarize = (items, max) =>
  items.length > max ? `${items.slice(0, max).join(", ")} +${items.length - max} more` : items.join(", ");

// ---------- answers ----------

function help() {
  return {
    tools: [{ name: "list_commands", args: "", result: plural(COMMANDS.length, "command") }],
    blocks: [
      { type: "p", text: "Here's what I can answer. Plain questions work too, like **“what's your stack?”**" },
      { type: "table", head: ["command", "what it does"], rows: COMMANDS.map(([c, d]) => [`\`${c}\``, d]) },
      { type: "note", text: DEMO_NOTE },
    ],
  };
}

function whoami() {
  return {
    tools: [
      { name: "get_profile", args: "", result: "1 result" },
      { name: "get_stats", args: "", result: plural(stats.length, "result") },
    ],
    blocks: [
      { type: "p", text: `**${profile.name}** · ${profile.title} · ${profile.location}` },
      { type: "p", text: profile.summary },
      { type: "table", head: ["metric", "value"], rows: stats.map((s) => [s.label, `**${s.value}**`]) },
      contactLinks(),
    ],
  };
}

function projectList() {
  return {
    tools: [{ name: "get_projects", args: "", result: plural(projects.length, "result") }],
    blocks: [
      { type: "p", text: `${firstName}'s flagship work: ${projects.length} connected products for one options analytics company.` },
      {
        type: "list",
        ordered: true,
        items: projects.map((p) => `**${p.title}**: ${p.description}`),
      },
      { type: "p", text: "Type `project 1` (or an id like `project desktop-agent`) for architecture and details." },
      caseStudyAction("See case studies"),
    ],
  };
}

function projectDetail(p) {
  const n = projects.indexOf(p) + 1;
  const blocks = [
    { type: "p", text: `**${n}. ${p.title}**` },
    { type: "p", text: p.description },
  ];
  if (p.points?.length) blocks.push({ type: "list", items: p.points });
  if (p.flow?.length) blocks.push({ type: "code", text: p.flow.join(" → ") });
  blocks.push({ type: "tags", items: p.tech });
  blocks.push(caseStudyAction());

  const tools = [{ name: "get_project", args: `id="${p.id}"`, result: "1 result" }];
  if (p.flow?.length) tools.push({ name: "get_architecture", args: `id="${p.id}"`, result: plural(p.flow.length, "node") });
  return { tools, blocks };
}

function projectNotFound(query) {
  return {
    tools: [{ name: "get_project", args: `id="${query}"`, result: "0 results" }],
    blocks: [
      { type: "p", text: `I couldn't find a project matching **${query}**. Available:` },
      { type: "list", ordered: true, items: projects.map((p) => `\`${p.id}\`: ${p.title}`) },
    ],
  };
}

function stack() {
  const total = skills.reduce((n, g) => n + g.items.length, 0);
  return {
    tools: [{ name: "get_skills", args: 'group="all"', result: `${plural(total, "skill")} · ${skills.length} groups` }],
    blocks: [
      { type: "p", text: "Stack by category:" },
      { type: "table", head: ["category", "highlights"], rows: skills.map((g) => [`**${g.group}**`, summarize(g.items, 6)]) },
      {
        type: "actions",
        items: [{ label: "Full skills section", action: "scroll", target: "skills", icon: "arrow", primary: true }],
      },
    ],
  };
}

const AI_TECH = /bedrock|langgraph|langfuse|anthropic|gemini|elevenlabs|mcp|claude|openai/i;

function ai() {
  const aiGroup = skills.find((g) => /ai|llm/i.test(g.group));
  const aiProjects = projects.filter((p) => p.tech.some((t) => AI_TECH.test(t)));
  const tools = [{ name: "search_projects", args: 'tag="ai"', result: plural(aiProjects.length, "result") }];
  if (aiGroup) tools.push({ name: "get_skills", args: `group="${aiGroup.group}"`, result: plural(aiGroup.items.length, "result") });

  const blocks = [
    { type: "p", text: `AI work ${firstName} has shipped to production:` },
    { type: "list", items: aiProjects.map((p) => `**${p.title}**: ${p.points?.[0] ?? p.description}`) },
  ];
  if (aiGroup) blocks.push({ type: "tags", items: aiGroup.items });
  blocks.push({ type: "p", text: "Ask `project 1` to see how the research agent is wired end to end." });
  blocks.push(caseStudyAction());
  return { tools, blocks };
}

function experienceAnswer() {
  const blocks = [];
  experience.forEach((job) => {
    blocks.push({ type: "p", text: `**${job.role}** · ${job.company} · ${job.period}` });
    blocks.push({ type: "list", items: job.points.slice(0, 3) });
  });
  blocks.push({
    type: "actions",
    items: [
      { label: "Full timeline", action: "scroll", target: "experience", icon: "arrow", primary: true },
      { label: "Open resume", action: "openResume", icon: "file" },
    ],
  });
  return {
    tools: [{ name: "get_experience", args: "", result: plural(experience.length, "role") }],
    blocks,
  };
}

function educationAnswer() {
  return {
    tools: [{ name: "get_education", args: "", result: plural(education.length, "result") }],
    blocks: [
      {
        type: "list",
        items: education.map((e) => `**${e.degree}**, ${e.school} · ${e.period}${e.note ? ` · ${e.note}` : ""}`),
      },
    ],
  };
}

function hire() {
  return {
    tools: [{ name: "get_contact", args: "", result: "3 channels" }],
    blocks: [
      { type: "p", text: `Great choice. ${firstName} works directly with teams and clients, and the fastest route is email.` },
      {
        type: "table",
        head: ["channel", "where"],
        rows: [
          ["Email", profile.email],
          ["GitHub", handle(profile.github)],
          ["LinkedIn", handle(profile.linkedin)],
          ["Based in", profile.location],
        ],
      },
      contactActions(),
    ],
  };
}

function sudoHire() {
  return {
    tools: [
      { name: "check_permissions", args: 'user="recruiter"', result: "granted" },
      { name: "get_contact", args: "", result: "3 channels" },
    ],
    blocks: [
      { type: "p", text: "[sudo] password for recruiter: ********" },
      { type: "p", text: `**Permission granted.** ${profile.name} has been added to your shortlist. Next step: say hello.` },
      contactLinks(),
      contactActions(),
    ],
  };
}

function sudoOther() {
  return {
    tools: [{ name: "check_permissions", args: 'user="visitor"', result: "denied" }],
    blocks: [
      { type: "p", text: "Nice try. This incident will be reported to… nobody, actually." },
      { type: "p", text: "The only sudo command I accept is `sudo hire jaydip`." },
    ],
  };
}

function resume() {
  return {
    tools: [{ name: "get_resume", args: "", result: "1 file · PDF" }],
    blocks: [
      { type: "p", text: `Here's ${firstName}'s resume. Same content as this site, in one PDF.` },
      {
        type: "actions",
        items: [
          { label: "Open resume", action: "openResume", icon: "file", primary: true },
          { label: "Copy email", action: "copyEmail", icon: "copy" },
        ],
      },
    ],
  };
}

function ls() {
  return {
    tools: [{ name: "list_sections", args: "", result: plural(navSections.length, "result") }],
    blocks: [
      { type: "code", text: navSections.map((s) => `${s.id}/`).join("  ") },
      {
        type: "actions",
        items: navSections.filter((s) => s.id !== "agent").map((s) => ({ label: `cd ${s.id}`, action: "scroll", target: s.id, icon: "arrow" })),
      },
    ],
  };
}

function fallback(input) {
  const q = input.length > 40 ? `${input.slice(0, 40)}…` : input;
  return {
    tools: [{ name: "search_portfolio", args: `query="${q}"`, result: "0 results" }],
    blocks: [
      { type: "p", text: `I don't have a scripted answer for **“${q}”** yet.` },
      { type: "p", text: "Try `projects`, `stack`, `experience`, `ai`, `hire`, or `help` for everything." },
      { type: "note", text: DEMO_NOTE },
    ],
  };
}

// ---------- routing ----------

function findProject(query) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const n = Number.parseInt(q, 10);
  if (String(n) === q && n >= 1 && n <= projects.length) return projects[n - 1];
  return (
    projects.find((p) => p.id === q) ||
    projects.find((p) => p.id.includes(q) || p.title.toLowerCase().includes(q)) ||
    null
  );
}

// Natural-language hints → project id (routing only; content comes from data).
const PROJECT_HINTS = [
  [/\b(opra|dark ?pool|pipeline|market data|firehose)\b/, "opra-pipeline"],
  [/\b(voice|speech|elevenlabs)\b/, "voice-agent"],
  [/\b(desktop|electron|mcp|tradingview)\b/, "desktop-agent"],
  [/\b(research agent|analytics platform|options platform)\b/, "agent-platform"],
];

const has = (re, s) => re.test(s);

export function respond(rawInput) {
  const input = rawInput.trim();
  const s = input.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
  const answer = (r) => ({ kind: "answer", ...r });

  if (!s) return answer(help());
  if (has(/^(clear|cls|reset)$/, s)) return { kind: "clear" };

  if (s.startsWith("sudo")) return answer(has(/\bhire\b/, s) ? sudoHire() : sudoOther());

  const explicit = s.match(/^(?:project|cat|open|show project)\s+#?(.+)$/);
  if (explicit) {
    const p = findProject(explicit[1]);
    if (p) return answer(projectDetail(p));
    // "open resume" / "open github" should route normally; only "project x" reports a miss.
    if (/^(project|show project)\b/.test(s)) return answer(projectNotFound(explicit[1]));
  }
  const byNumber = findProject(s);
  if (byNumber && /^\d+$/.test(s)) return answer(projectDetail(byNumber));

  if (has(/^(help|\?|man|commands?)$|\b(help|what can you do|how does this work)\b/, s)) return answer(help());
  if (has(/^ls\b|\b(sections|sitemap)\b/, s)) return answer(ls());
  if (has(/\b(hire|hiring|contact|email|reach|available|availability|talk|connect|github|linkedin)\b/, s)) return answer(hire());
  if (has(/\b(resume|cv|pdf)\b/, s)) return answer(resume());
  if (has(/\b(education|degree|university|college|study|studied|school)\b/, s)) return answer(educationAnswer());
  if (has(/\b(experience|work history|career|jobs?|roles?|employment|background)\b/, s)) return answer(experienceAnswer());
  if (has(/\b(stack|skills?|tech|technolog(y|ies)|languages?|frameworks?|tools you use)\b/, s)) return answer(stack());

  for (const [re, id] of PROJECT_HINTS) {
    if (re.test(s)) return answer(projectDetail(projects.find((p) => p.id === id) ?? projects[0]));
  }

  if (has(/\b(ai|llm|llms|agents?|agentic|claude|bedrock|langgraph|langchain|deepagents?|rag)\b/, s)) return answer(ai());
  if (has(/\b(projects?|portfolio|built|build|shipped|products?)\b/, s)) return answer(projectList());
  if (has(/^(whoami|who ?am ?i)$|\b(who are you|who is|about|introduce|yourself|jaydip|summary|bio)\b/, s)) return answer(whoami());
  if (has(/^(hi|hello|hey|yo|sup)\b/, s)) {
    return answer({
      tools: [],
      blocks: [{ type: "p", text: "Hey! Try `whoami`, `projects` or `stack`, or ask a question in plain English." }],
    });
  }

  return answer(fallback(input));
}
