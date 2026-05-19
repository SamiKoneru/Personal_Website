export type ProjectCategory =
  | "Machine Learning"
  | "Reinforcement Learning"
  | "Systems & Engines"
  | "Web Apps";

export type Project = {
  slug: string;
  name: string;
  category: ProjectCategory;
  description: string;
  stack: string[];
  href?: string;
  featured?: boolean;
};

export const categories: ProjectCategory[] = [
  "Machine Learning",
  "Reinforcement Learning",
  "Systems & Engines",
  "Web Apps",
];

export const categoryColor: Record<ProjectCategory, string> = {
  "Machine Learning": "var(--cat-ml)",
  "Reinforcement Learning": "var(--cat-rl)",
  "Systems & Engines": "var(--cat-sys)",
  "Web Apps": "var(--cat-web)",
};

export const projects: Project[] = [
  {
    slug: "custom-digit-classifier",
    name: "Custom Digit Classifier",
    category: "Machine Learning",
    description:
      "CNN built from scratch in C++/CUDA with hand-written backprop, im2col, and GEMM kernels. 99%+ on MNIST at ~10% the throughput of an equivalent PyTorch/cuDNN model on T4 GPUs.",
    stack: ["C++", "CUDA"],
    featured: true,
  },
  {
    slug: "gpt2",
    name: "GPT-2 from scratch",
    category: "Machine Learning",
    description:
      "124M-parameter decoder-only transformer with causal self-attention and learned positional encodings. Optimized for multi-GPU CUDA with minimized CPU-GPU sync — 11× speedup over the pre-optimized baseline.",
    stack: ["PyTorch", "CUDA", "Python"],
    featured: true,
  },
  {
    slug: "trans-scratch",
    name: "Transformer from scratch",
    category: "Machine Learning",
    description:
      "A transformer built in pure NumPy — no autograd, manual backprop through attention and FFN blocks.",
    stack: ["NumPy", "Python"],
  },
  {
    slug: "cnn-scratch",
    name: "CNN from scratch",
    category: "Machine Learning",
    description:
      "Convolutional neural net implemented from scratch in NumPy, including manual conv and pool gradients.",
    stack: ["NumPy", "Python"],
  },
  {
    slug: "brain-ager",
    name: "Brain Ager",
    category: "Machine Learning",
    description:
      "CNN that predicts age from brain MRI scans, trained on the IXI-T1 dataset.",
    stack: ["PyTorch", "MRI"],
  },
  {
    slug: "ai-image-detector",
    name: "AI Image Detector",
    category: "Machine Learning",
    description: "CNN for classifying AI-generated vs. real images.",
    stack: ["PyTorch"],
  },
  {
    slug: "proteins",
    name: "Protein Function Prediction",
    category: "Machine Learning",
    description: "CAFA-6 protein function prediction pipeline.",
    stack: ["Python", "Bio"],
  },
  {
    slug: "recommender",
    name: "Book Recommender",
    category: "Machine Learning",
    description: "Collaborative-filtering book recommendation system.",
    stack: ["Python"],
  },
  {
    slug: "titanic",
    name: "Titanic ML",
    category: "Machine Learning",
    description: "Classic Kaggle Titanic notebook — feature work and modeling.",
    stack: ["Python", "Jupyter"],
  },
  {
    slug: "catan-bot",
    name: "Catan PPO Agent",
    category: "Reinforcement Learning",
    description:
      "Reinforcement learning agent for Settlers of Catan trained with Proximal Policy Optimization.",
    stack: ["PyTorch", "PPO"],
  },
  {
    slug: "codenames-bot",
    name: "Codenames LLM Bot",
    category: "Reinforcement Learning",
    description:
      "LLM + RL self-play for Codenames using SFT and GRPO on filtered rollouts.",
    stack: ["HuggingFace", "GRPO"],
  },
  {
    slug: "chessbot",
    name: "Chess Engine",
    category: "Systems & Engines",
    description:
      "Negamax + alpha-beta chess engine with quiescence search and a Zobrist-keyed transposition table. Tkinter UI.",
    stack: ["Python", "Tkinter"],
  },
  {
    slug: "dreamit",
    name: "DreamIT Engine",
    category: "Systems & Engines",
    description:
      "Procedural game world generation engine built on Bevy ECS — GameSpec → validation → spawn rules → chunk output.",
    stack: ["Rust", "Bevy"],
  },
  {
    slug: "bs",
    name: "Drowsiness Detector",
    category: "Systems & Engines",
    description:
      "Real-time driver drowsiness detection using eye- and mouth-aspect ratios from a webcam feed.",
    stack: ["Python", "dlib"],
  },
  {
    slug: "berkeley-consulting-bot",
    name: "Berkeley Consulting Bot",
    category: "Web Apps",
    description: "RAG-based consulting assistant with a Weaviate vector store.",
    stack: ["Python", "Weaviate"],
  },
  {
    slug: "auto-applyer",
    name: "Auto Applyer",
    category: "Web Apps",
    description:
      "Automated job application tool with LLM-powered resume tailoring.",
    stack: ["Python", "SQLite", "LLM"],
  },
  {
    slug: "cf-ai-project-planner",
    name: "Project Planner (Cloudflare)",
    category: "Web Apps",
    description:
      "AI project planner on Cloudflare — Durable Objects for state, Workers AI for the LLM, React + WebSocket frontend.",
    stack: ["Cloudflare", "React", "Vite"],
  },
  {
    slug: "file-hoster",
    name: "File Hoster",
    category: "Web Apps",
    description:
      "Flask file hosting service with public/private visibility, CSRF, and session auth.",
    stack: ["Flask", "SQLite"],
  },
  {
    slug: "startup-project",
    name: "Secure File Storage",
    category: "Web Apps",
    description:
      "Flask web app for secure file storage with auth and hashed passwords.",
    stack: ["Flask", "SQLite"],
  },
];
