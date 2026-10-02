// Single source of truth for site content. Keep in sync with the resume PDF.

export const profile = {
  name: "Jaydip Vasoya",
  title: "Senior Full Stack Engineer",
  tagline: "Python, Django, React, AWS · AI Agents and FinTech",
  location: "Ahmedabad, India",
  email: "jpvasoya444@gmail.com",
  github: "https://github.com/jp-vasoya-02",
  linkedin: "https://www.linkedin.com/in/jaydip-vasoya",
  blog: "https://jpvasoya.blogspot.com/",
  resume: "/Jaydip_Vasoya_Resume.pdf",
  summary:
    "Senior Full Stack Engineer with over 6 years of experience building FinTech platforms and production AI products. Recent work includes an LLM research agent on Claude and AWS Bedrock, a desktop AI assistant that reads and controls live trading charts through a Model Context Protocol (MCP) server, a real time voice AI assistant, and a market data pipeline that processes the US options (OPRA) firehose. Comfortable owning a product from architecture to production and working directly with clients.",
};

export const stats = [
  { value: "6+", label: "Years building production software" },
  { value: "105", label: "MCP tools behind a desktop AI agent" },
  { value: "130+", label: "Live analytics pages shipped" },
  { value: "1,500+", label: "Automated tests on a voice AI product" },
];

export const experience = [
  {
    role: "Senior Full Stack FinTech and AI Engineer",
    company: "Freelance",
    location: "Remote",
    period: "Jan 2025 to Present",
    points: [
      "Long term engineering partner for an options analytics company, delivering four connected products: a web analytics platform, a real time market data pipeline, a desktop AI app, and a voice AI assistant.",
      "Built the platform's AI research agent with LangGraph and DeepAgents on Claude through AWS Bedrock, with token streaming over WebSockets, 16 tools, Postgres backed conversation state, and prompt caching.",
      "Engineered a pipeline that ingests a vendor's OPRA options firehose and dark pool trades into Redis Streams, using bounded queues, batched writes of 5,000 messages, and 60 second aggregation across 8 parallel jobs.",
      "Shipped a cross platform Electron desktop app in which an AI agent reads and controls live TradingView charts through an MCP server exposing 105 tools.",
      "Developed a real time voice AI assistant on Django Channels with Gemini Live and ElevenLabs and metered usage billing, covered by more than 1,500 automated tests.",
      "Hardened production infrastructure, including memory limits and an eviction policy for a Redis instance holding over 10 million keys, plus Nginx and Gunicorn tuning.",
    ],
  },
  {
    role: "Senior Software Engineer and Partner",
    company: "LNX Cloud Technology",
    period: "Jan 2020 to Jan 2025",
    points: [
      "Led the architecture and development of scalable cloud applications for clients in FinTech, SaaS, and social media.",
      "Built real time systems with WebSockets and Django Channels that powered live market data feeds and chat products serving thousands of concurrent users.",
      "Improved backend performance and integrated AWS services to achieve high availability, security, and monitoring across production systems.",
      "Mentored junior developers, ran code reviews, and set engineering standards that improved delivery speed and code quality across the team.",
    ],
  },
];

export const projects = [
  {
    id: "agent-platform",
    visual: "agent",
    title: "AI Options Analytics Platform",
    flow: ["Browser", "WebSocket gateway", "DeepAgent (Claude via Bedrock)", "16 tools", "Postgres state", "LangFuse traces"],
    description:
      "Core engineer on a subscription platform with four pricing tiers and 130+ analytics pages for options flow, dark pool, and volatility data, updated live over 100+ WebSocket routes.",
    points: [
      "AI research agent taken through eight versions, from semantic routing to multi agent to a single deep agent on Claude, traced end to end with LangFuse.",
      "Agent guardrails: server side tool argument limits, prompt leak detection, automatic context summarization, and a deterministic scoring engine.",
      "Per request LLM cost metering, a page level chart analysis assistant, and Stripe subscription billing.",
    ],
    tech: ["Django", "DRF", "Channels", "Celery", "PostgreSQL", "Redis", "AWS Bedrock", "LangGraph", "LangFuse", "Stripe"],
  },
  {
    id: "opra-pipeline",
    visual: "flow",
    title: "Real Time Options Flow and Dark Pool Pipeline",
    flow: ["OPRA firehose", "Bounded queue (50k)", "Redis Streams", "60s aggregation × 8", "WebSocket fan-out", "Analytics UI"],
    description:
      "A market data pipeline built to hold up under traffic bursts from the US options (OPRA) firehose and dark pool trades.",
    points: [
      "Stream writer with a bounded 50,000 item queue, a connection pool per stream, pipelined batch writes, and alerts on dropped messages.",
      "Two tier trade sentiment (bid/ask spread, tick rule fallback), a five minute correction pass, and atomic alert cooldowns.",
      "Burst detection on 200 ms buckets and self healing that restarts a stalled feed within three minutes.",
    ],
    tech: ["Python", "Redis Streams", "RediSearch", "WebSockets", "Multithreading", "AWS S3", "PM2"],
  },
  {
    id: "desktop-agent",
    visual: "mcp",
    title: "AI Desktop Trading Assistant",
    flow: ["User prompt", "Agent loop (Claude / Bedrock / Gemini)", "Approval gateway", "MCP server (105 tools)", "Chrome DevTools Protocol", "Live TradingView chart"],
    description:
      "A cross platform Electron app where an AI agent reads and controls live TradingView charts.",
    points: [
      "Agent loop with native tool calling for Anthropic, AWS Bedrock, and Gemini, plus token streaming, prompt caching, and request cancellation.",
      "MCP server exposing 105 tools in 17 groups over the Chrome DevTools Protocol to read indicators, switch symbols, draw levels, and create alerts.",
      "User approval for destructive actions at a single gateway; signed, notarized macOS and Windows builds with auto update.",
    ],
    tech: ["Electron", "React", "TypeScript", "Tailwind CSS", "Anthropic SDK", "AWS Bedrock", "Gemini", "MCP"],
  },
  {
    id: "voice-agent",
    visual: "voice",
    title: "Voice AI Trading Assistant",
    flow: ["Microphone", "Django Channels", "Gemini Live / ElevenLabs", "56 tools via asyncio", "Metering & spend caps", "Spoken reply"],
    description:
      "A browser based voice assistant with a live transcript, built on Django Channels.",
    points: [
      "Gemini Live native audio and ElevenLabs engines behind one interface, so the WebSocket layer is provider independent.",
      "56 tools exposed to the model, with a turn's tool calls run concurrently via asyncio to keep spoken replies fast.",
      "Usage metering with weekly and monthly spend caps and prepaid credits; Docker Compose behind Nginx with rate limiting, JWT, and MFA.",
    ],
    tech: ["Python", "Django Channels", "Celery", "PostgreSQL", "Redis", "Gemini Live", "ElevenLabs", "Docker", "Pytest"],
  },
];

export const additionalProjects = [
  {
    title: "Marketing and SEO website",
    description:
      "Next.js 16 and React 19 static export with lazy loaded React Three Fiber 3D scenes, JSON-LD structured data, and build checks for bundle size, SEO rules, and WCAG AA contrast.",
  },
  {
    title: "Real time stock market application",
    description:
      "React, TypeScript, and Django platform consuming a global exchange WebSocket feed and streaming updates to thousands of concurrent clients, with role based access control.",
  },
  {
    title: "AI image generation system",
    description:
      "FastAPI service running fine tuned LoRA models on Stable Diffusion, with scalable GPU inference infrastructure on AWS.",
  },
  {
    title: "Social media platform",
    description:
      "React Native and progressive web apps for media sharing, chat, shopping, and community Q&A; led the migration to a serverless AWS backend (AppSync, Lambda, DynamoDB).",
  },
  {
    title: "SDLC management platform",
    description:
      "NX monorepo frontend in React and Material UI with Django REST Framework APIs on AWS.",
  },
  {
    title: "Encrypted real time chat",
    description:
      "Django Channels chat with presence, read receipts, and RSA end to end encryption.",
  },
];

export const skills = [
  { group: "Languages", items: ["Python", "TypeScript", "JavaScript", "SQL"] },
  {
    group: "Backend",
    items: ["Django", "Django REST Framework", "Django Channels", "FastAPI", "Flask", "Node.js", "Celery", "WebSockets", "REST APIs"],
  },
  {
    group: "AI and LLM Engineering",
    items: [
      "Anthropic Claude", "AWS Bedrock", "Gemini Live API", "OpenAI", "LangGraph", "LangChain", "DeepAgents", "LangFuse",
      "MCP", "AI Agents", "Tool Calling", "Multi Agent Systems", "RAG", "Prompt Caching", "Voice AI (ElevenLabs)",
      "Hugging Face", "Stable Diffusion", "LoRA",
    ],
  },
  {
    group: "FinTech",
    items: ["Real time market data", "OPRA options feed", "Options flow and dark pool analytics", "TradingView integration", "Stripe billing"],
  },
  {
    group: "Frontend and Desktop",
    items: ["React.js", "Next.js", "Electron", "React Native", "Redux", "Zustand", "Tailwind CSS", "Material UI", "Three.js"],
  },
  { group: "Databases", items: ["PostgreSQL", "Redis (Streams, RediSearch)", "MySQL", "DynamoDB", "Amazon RDS"] },
  {
    group: "Cloud and DevOps",
    items: [
      "AWS (EC2, RDS, S3, Lambda, ECS, API Gateway, AppSync, CloudFront…)", "Docker", "Kubernetes", "Nginx",
      "GitHub Actions", "CI/CD", "Microservices", "Grafana",
    ],
  },
  { group: "Quality and Leadership", items: ["Pytest", "Unit and integration testing", "Code review", "Technical leadership", "Mentoring", "Client communication"] },
];

export const education = [
  {
    degree: "Bachelor of Computer Application, Computer Science",
    school: "Saurashtra University, Rajkot",
    period: "Oct 2019 to Mar 2022",
    note: "CGPA 8.75, First Distinction",
  },
  {
    degree: "Bachelor's Degree, Information Technology",
    school: "LDRP Institute of Technology and Research, Gandhinagar (Kadi Sarva Vishwavidyalaya)",
    period: "Jul 2017 to Aug 2019",
  },
];

// Scrolling "ticker tape" under the hero.
export const ticker = [
  { symbol: "PYTHON", note: "6Y" }, { symbol: "DJANGO", note: "DRF · CHANNELS" }, { symbol: "REACT", note: "TS" },
  { symbol: "CLAUDE", note: "BEDROCK" }, { symbol: "LANGGRAPH", note: "AGENTS" }, { symbol: "MCP", note: "105 TOOLS" },
  { symbol: "REDIS", note: "STREAMS" }, { symbol: "POSTGRES", note: "RDS" }, { symbol: "AWS", note: "EC2 · LAMBDA · ECS" },
  { symbol: "OPRA", note: "FIREHOSE" }, { symbol: "WEBSOCKETS", note: "100+ ROUTES" }, { symbol: "ELECTRON", note: "DESKTOP" },
  { symbol: "GEMINI", note: "LIVE API" }, { symbol: "DOCKER", note: "K8S" }, { symbol: "STRIPE", note: "BILLING" },
];

// Suggested prompts for the "Ask my agent" terminal. Answers are built from the data above.
export const terminalPrompts = ["whoami", "projects", "stack", "experience", "hire", "resume"];

// Direct, quotable answers for the FAQ section, the prerendered HTML and FAQPage schema.
export const faq = [
  {
    q: "What does Jaydip Vasoya specialize in?",
    a: "Jaydip is a Senior Full Stack Engineer who builds FinTech platforms and production AI products: LLM agents on Claude and AWS Bedrock, Model Context Protocol (MCP) servers, real time voice assistants, and market data pipelines for the US options (OPRA) feed.",
  },
  {
    q: "Is Jaydip available for freelance or full-time work?",
    a: "Yes. He takes freelance engagements and is open to senior full stack or AI engineering roles. Email jpvasoya444@gmail.com to start a conversation.",
  },
  {
    q: "What is Jaydip's tech stack?",
    a: "Python, Django, Django REST Framework, Django Channels, FastAPI, Celery, React, Next.js, TypeScript, Electron, PostgreSQL, Redis Streams and AWS (EC2, RDS, S3, Lambda, ECS, Bedrock), plus LangGraph, LangChain and MCP for AI agents.",
  },
  {
    q: "Has Jaydip built production AI agents?",
    a: "Yes. He built an AI research agent on Claude via AWS Bedrock with 16 tools and token streaming, a desktop trading assistant driven by an MCP server with 105 tools, and a voice AI assistant with 56 tools covered by more than 1,500 automated tests.",
  },
  {
    q: "How many years of experience does Jaydip have?",
    a: "Over 6 years building production software, including five years as Senior Software Engineer and Partner at LNX Cloud Technology and freelance FinTech and AI work since January 2025.",
  },
  {
    q: "Where is Jaydip based and which time zones does he work in?",
    a: "He is based in Ahmedabad, India (IST, UTC+5:30) and works remotely with clients and teams worldwide.",
  },
];
