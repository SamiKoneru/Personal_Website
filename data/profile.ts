export type Link = { label: string; href: string };

export type Job = {
  role: string;
  company: string;
  location?: string;
  period: string;
  description?: string;
  bullets?: string[];
  tech?: string[];
  /** CSS background (gradient or solid) for the company logo tile, used when no logo image is set. */
  color?: string;
  /** Optional path to a logo image, e.g. "/logos/dreamit.png" in public/. */
  logo?: string;
  /** Scale up a logo that has empty margin baked into the file. 1 = as-is. */
  logoScale?: number;
};

export type Education = {
  school: string;
  degree: string;
  period?: string;
  detail?: string;
  coursework?: string[];
  /** Optional path to an image, e.g. "/berkeley.jpg" in public/. */
  image?: string;
};

export type CurrentlyItem = { label: string; value: string };
export type Interest = { title: string; detail?: string };
export type Skill = {
  name: string;
  /** devicon path segment, e.g. "python/python-original". Omit if no brand icon. */
  icon?: string;
  /** Set for dark/monochrome icons (e.g. Rust) so they stay visible in dark mode. */
  invertOnDark?: boolean;
};

export const profile = {
  name: "Sami Koneru-Ansari",
  tagline: "Building ML systems from the ground up.",
  email: "samikoneruansari@gmail.com",
  status: "Open to new opportunities",

  about:
    "EECS at UC Berkeley. Currently at Intel building deep learning primitives in " +
    "oneDNN. Previously optimized LLM inference at Piris Labs, with CUDA kernels " +
    "and from-scratch paper reimplementations on the side.",

  links: [
    { label: "GitHub", href: "https://github.com/SamiKoneru" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/sami-kon" },
    { label: "Email", href: "mailto:samikoneruansari@gmail.com" },
    { label: "Resume", href: "/resume.pdf" },
  ] satisfies Link[],

  education: [
    {
      school: "University of California, Berkeley",
      degree: "B.S. Electrical Engineering and Computer Science",
      detail: "4.0 GPA",
      coursework: [
        "Data Structures and Algorithms",
        "Machine Learning",
        "Machine Structures",
        "Signal Processing",
        "Computer Networks",
        "Discrete Mathematics",
        "Probability Theory",
        "Linear Algebra",
      ],
      // Drop a real photo at personal_website/public/berkeley.jpg and uncomment:
      image: "/UC-Berkeley-Seal-Logo.png",
    },
  ] satisfies Education[],

  skills: [
    { name: "Python", icon: "python/python-original" },
    { name: "C++", icon: "cplusplus/cplusplus-original" },
    { name: "CUDA" },
    { name: "PyTorch", icon: "pytorch/pytorch-original" },
    { name: "SGLang" },
    { name: "Rust", icon: "rust/rust-original", invertOnDark: true },
    { name: "TypeScript", icon: "typescript/typescript-original" },
    { name: "React", icon: "react/react-original" },
    { name: "Node.js", icon: "nodejs/nodejs-original" },
    { name: "PostgreSQL", icon: "postgresql/postgresql-original" },
    { name: "LangChain" },
    { name: "Docker", icon: "docker/docker-original" },
    { name: "Kubernetes", icon: "kubernetes/kubernetes-plain" },
    { name: "GCP", icon: "googlecloud/googlecloud-original" },
    { name: "AWS" },
  ] satisfies Skill[],

  experience: [
    {
      role: "AI Software Engineer Intern",
      company: "Intel",
      location: "Folsom, CA",
      period: "Sept 2026 — Present",
      bullets: [
        "Developing deep learning primitives in oneDNN, Intel's open-source library behind PyTorch and TensorFlow on Intel hardware, working in C++ on Linux across floating-point arithmetic, numerical accuracy, and library architecture.",
      ],
      tech: ["C++", "oneDNN", "Linux"],
      color: "linear-gradient(135deg, #0071c5, #00c7fd)",
      logo: "/intel.png",
    },
    {
      role: "Machine Learning Engineer Intern",
      company: "Piris Labs",
      location: "Remote",
      period: "June 2026 — Aug 2026",
      bullets: [
        "Built ML infrastructure to optimize LLM inference on B200 GPUs, spanning automated GCP deployment, SGLang serving, prefix caching, multi-tenancy, and per-instance routing, as groundwork for custom photonics hardware.",
        "Researched and implemented scheduling and batching policies that cut median end-to-end latency by over 50%.",
        "Benchmarked speculative decoding, batching, scheduling, and routing on unified and disaggregated systems, reaching 483 tok/s on GLM 5.2, 23% more than Databricks.",
      ],
      tech: ["SGLang", "CUDA", "GCP", "Kubernetes"],
      color: "linear-gradient(135deg, #6366f1, #06b6d4)",
      logo: "/pirislabs.png",
      logoScale: 1.45,
    },
    {
      role: "Founding Software Engineer",
      company: "DreamIt",
      location: "Berkeley, CA",
      period: "Feb 2026 — May 2026",
      bullets: [
        "Directed a 3-person engineering team shipping end-to-end Rust features for an early-stage no-code gaming app, scaling to 1,400+ users.",
        "Architected an async Claude API pipeline that generates playable games from natural-language prompts.",
      ],
      tech: ["Rust", "Claude API"],
      color: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      logo: "/dreamitnow_logo.jpeg",
    },
    {
      role: "Data Science Intern",
      company: "TokenWorks",
      location: "Remote",
      period: "Feb 2026 — May 2026",
      bullets: [
        "Fine-tuned BART-base as a sequence-to-sequence tagger for low-resource Sumerian, jointly predicting part of speech, lemma, and English gloss from 217K CoNLL-U tokens of transliterated cuneiform in a single decoding pass.",
        "Built a self-hosted Wikibase lexical knowledge graph with idempotent Python importers mirroring Wikidata's Sumerian lexeme schema through a resumable, checkpointed pipeline.",
      ],
      tech: ["PyTorch", "BART", "Docker", "Wikibase"],
      color: "linear-gradient(135deg, #ec4899, #f59e0b)",
      logo: "/tokenworks.jpeg",
    },
    {
      role: "Machine Learning Engineer (Contract)",
      company: "GetGreen",
      location: "Remote",
      period: "Sept 2025 — Dec 2025",
      bullets: [
        "Engineered a RAG chatbot using LangChain and ChromaDB for semantic search over 1,000+ scraped articles, answering sustainability questions in under 3 seconds.",
        "Scraped and processed the retrieval corpus with BeautifulSoup, pandas, and SQL.",
      ],
      tech: ["LangChain", "ChromaDB", "pandas", "SQL"],
      color: "linear-gradient(135deg, #10b981, #06b6d4)",
      logo: "/emeraldtechnologygroup_logo.jpeg",
    },
    {
      role: "Software Development Intern",
      company: "California Department of Technology",
      location: "Rancho Cordova, CA",
      period: "May 2024 — July 2024",
      bullets: [
        "Built full-stack web apps with HTML/CSS/JS for the frontend, Node.js for the backend, PostgreSQL for relational data, and JWT authentication to manage scheduling and file sharing for 100+ employees.",
        "Managed datasets of 500+ employees and 70+ clients using SQL and Excel to drive operational reporting.",
      ],
      tech: ["Node.js", "PostgreSQL", "JWT", "SQL"],
      color: "linear-gradient(135deg, #f59e0b, #ef4444)",
      logo: "/Cal-Dept-Tech.png",
    },
  ] satisfies Job[],

  currently: [
    { label: "Building", value: "Deep learning primitives in oneDNN at Intel" },
    {
      label: "Researching",
      value: "Learned validity signals for stale context in world models",
    },
    { label: "Writing", value: "GPU kernels in C++/CUDA on the side" },
  ] satisfies CurrentlyItem[],

  interests: [
    {
      title: "Chess",
      detail: "Built my own engine using negamax + alpha-beta search.",
    },
    {
      title: "Game engines",
      detail: "Procedural world generation in Rust + Bevy ECS.",
    },
    {
      title: "From-scratch ML",
      detail: "Reimplementing GPT-2, transformers, and CNNs by hand.",
    },
  ] satisfies Interest[],
} as const;
