
/**
 * Architecture graph types.
 *
 * These were React Flow's Node and Edge. The graphs are kept — they are the
 * real architecture of each system and the world renders them in place — but
 * the dependency is not, because nothing here draws a 2D flow canvas any
 * more. The shapes are narrowed to what the data actually uses.
 */
export interface ArchNode {
    id: string;
    type?: string;
    position: { x: number; y: number };
    data: { title: string; label: string };
}

export interface ArchEdge {
    id: string;
    source: string;
    target: string;
    animated?: boolean;
    style?: { stroke: string };
}

export interface Project {
    title: string;
    subtitle: string;
    description: string;
    tech: string[]; // For the card
    gridSpan: string;
    color: string;
    tag: string;
    isGithub?: boolean;

    // Modal specific
    slug: string;
    statusPill?: string; // "Flagship", "Major", etc.
    aim: string[];
    built: string[]; // "What I built"
    techStackDetailed: { // Grouped chips
        category: string;
        stack: string[];
    }[];
    architecture: string[]; // Legacy simple list
    flowData?: {
        nodes: ArchNode[];
        edges: ArchEdge[];
    };
    engineeringDecisions: {
        decision: string;
        why: string;
        impact: string;
    }[];
    security: string[];
    results: string[]; // Measurable items or outputs
    links: {
        github: string;
        allRepos: string;
        demo?: string;
        video?: string;
    };
}

export const projects: Project[] = [
    {
        title: "PROJECT VICTUS",
        subtitle: "Agentic AI Assistant Platform",
        description:
            "A production-grade, fully autonomous AI assistant with dynamic tooling, persistent memory, and Retrieval-Augmented Generation (RAG). Designed with modular agent routing and system-level automation.",
        tech: ["Python", "FastAPI", "LangChain", "FAISS", "Gemini", "Redis", "Docker"],
        gridSpan: "col-span-1 md:col-span-2",
        color: "#00F0FF",
        tag: "FLAGSHIP",

        slug: "#project-victus",
        statusPill: "Flagship",
        aim: [
            "Build an autonomous assistant with tool routing and memory",
            "Enable RAG based knowledge retrieval",
            "Support repeatable automation flows"
        ],
        built: [
            "Autonomous agent loop with dynamic tool selection",
            "Persistent conversational memory using Redis",
            "RAG pipeline for accessing custom knowledge bases",
            "Modular routing system for intent classification"
        ],
        techStackDetailed: [
            { category: "AI Layer", stack: ["LangChain", "Gemini", "FAISS"] },
            { category: "Backend", stack: ["Python", "FastAPI"] },
            { category: "Data", stack: ["Redis", "PostgreSQL"] },
            { category: "Infra", stack: ["Docker", "GCP"] }
        ],
        architecture: [
            "UI", "API Gateway", "Tool Router", "Memory Store", "Vector Store", "Retriever", "Generator", "Observability"
        ],
        flowData: {
            nodes: [
                { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { title: 'User Interface', label: 'Frontend' } },
                { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { title: 'API Gateway', label: 'FastAPI' } },
                { id: '3', type: 'custom', position: { x: 250, y: 200 }, data: { title: 'Tool Router', label: 'LangChain Agent' } },
                { id: '4', type: 'custom', position: { x: 50, y: 300 }, data: { title: 'Memory Store', label: 'Redis' } },
                { id: '5', type: 'custom', position: { x: 450, y: 300 }, data: { title: 'Vector Store', label: 'FAISS' } },
                { id: '6', type: 'custom', position: { x: 450, y: 400 }, data: { title: 'Retriever', label: 'RAG Module' } },
                { id: '7', type: 'custom', position: { x: 250, y: 400 }, data: { title: 'Generator', label: 'Gemini LLM' } }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e3-7', source: '3', target: '7', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e3-6', source: '3', target: '6', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e6-5', source: '6', target: '5', animated: true, style: { stroke: '#00F0FF' } },
            ]
        },
        engineeringDecisions: [
            {
                decision: "Used LangChain for orchestration",
                why: "To simplify the management of complex agentic workflows and tool integrations.",
                impact: "Reduced development time for new tools by 40%."
            },
            {
                decision: "Redis for memory persistence",
                why: "To enable low-latency state management across session turns.",
                impact: "Sub-millisecond context retrieval for each user interaction."
            },
            {
                decision: "Hybrid RAG approach",
                why: "To balance between precision (vector search) and breadth (keyword search).",
                impact: "Improved retrieval accuracy for technical queries."
            }
        ],
        security: [
            "OAuth2 authentication flow",
            "API rate limiting",
            "Secret management via Vault",
            "Input sanitization for prompt injection defense"
        ],
        results: [
            "Production-ready tool routing agent",
            "Sub-2s average response latency",
            "Successfully handles multi-step complex queries"
        ],
        links: {
            github: "https://github.com/jadhavgaurav",
            allRepos: "https://github.com/jadhavgaurav"
        }
    },
    {
        title: "GITHUB REPOSITORIES",
        subtitle: "Open Source Contributions",
        description: "Explore all my projects and contributions on GitHub",
        tech: [],
        gridSpan: "col-span-1",
        color: "#00F0FF",
        tag: "OPEN SOURCE",
        isGithub: true,

        slug: "#github",
        aim: ["Share open source work", "Contribute to community"],
        built: [],
        techStackDetailed: [],
        architecture: [],
        engineeringDecisions: [],
        security: [],
        results: [],
        links: {
            github: "https://github.com/jadhavgaurav",
            allRepos: "https://github.com/jadhavgaurav"
        }
    },
    {
        title: "ALSONOTIFY",
        subtitle: "Enterprise Project & Task Management SaaS",
        description:
            "A scalable enterprise-grade project management platform built for team collaboration, task tracking, and role-based workflows.",
        tech: ["Next.js", "Web App Architecture", "SaaS", "APIs"],
        gridSpan: "col-span-1",
        color: "#D946EF",
        tag: "SAAS",

        slug: "#alsonotify",
        statusPill: "Major",
        aim: [
            "Build team task ownership and client visibility",
            "Centralize projects, tasks, and communication"
        ],
        built: [
            "Role-based access control (RBAC) system",
            "Real-time notification engine",
            "Kanban and List views for task management",
            "Client portal for external visibility"
        ],
        techStackDetailed: [
            { category: "Frontend", stack: ["Next.js", "React", "Tailwind"] },
            { category: "Backend", stack: ["Node.js", "Prisma"] },
            { category: "Database", stack: ["PostgreSQL"] },
            { category: "Auth", stack: ["NextAuth.js"] }
        ],
        architecture: [
            "Web UI", "API", "Auth", "DB", "Notifications", "Audit Logs"
        ],
        flowData: {
            nodes: [
                { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { title: 'Web UI', label: 'Next.js App' } },
                { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { title: 'API Routes', label: 'Server Actions' } },
                { id: '3', type: 'custom', position: { x: 50, y: 200 }, data: { title: 'Auth', label: 'NextAuth' } },
                { id: '4', type: 'custom', position: { x: 250, y: 200 }, data: { title: 'Database', label: 'PostgreSQL' } },
                { id: '5', type: 'custom', position: { x: 450, y: 200 }, data: { title: 'Notifications', label: 'Socket system' } }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e2-5', source: '2', target: '5', animated: true, style: { stroke: '#D946EF' } },
            ]
        },
        engineeringDecisions: [
            {
                decision: "Adopted Next.js App Router",
                why: "To leverage React Server Components for improved performance.",
                impact: "Faster initial page loads and better SEO."
            },
            {
                decision: "Prisma as ORM",
                why: "For type-safe database queries and easier schema management.",
                impact: "Eliminated runtime SQL errors during development."
            }
        ],
        security: [
            "RBAC middleware protection",
            "CSRF protection",
            "Encrypted data at rest",
            "Audit logging for sensitive actions"
        ],
        results: [
            "Full SaaS architecture implementation",
            "Scalable notification system handling concurrent users",
            "Secure role-based workflow engine"
        ],
        links: {
            github: "https://github.com/jadhavgaurav",
            allRepos: "https://github.com/jadhavgaurav"
        }
    },
    {
        title: "VISION-X",
        subtitle: "Real-Time Facial Attendance & Biometric Security",
        description:
            "An end-to-end facial recognition attendance system with anti-spoofing, person re-identification, and real-time demographic analysis.",
        tech: ["Python", "OpenCV", "Transformers", "FAISS", "ONNX"],
        gridSpan: "col-span-1",
        color: "#00F0FF",
        tag: "MAJOR SYSTEM",

        slug: "#vision-x",
        aim: [
            "Automate attendance tracking via face recognition",
            "Ensure security with liveness detection"
        ],
        built: [
            "Real-time face detection and embedding generation",
            "Anti-spoofing module using depth analysis",
            "Admin dashboard for attendance reports",
            "Edge deployment optimization"
        ],
        techStackDetailed: [
            { category: "CV", stack: ["OpenCV", "MediaPipe"] },
            { category: "Models", stack: ["Transformers", "ONNX"] },
            { category: "Vector DB", stack: ["FAISS"] },
            { category: "Language", stack: ["Python"] }
        ],
        architecture: [
            "Camera Feed", "Face Detector", "Liveness Check", "Feature Extractor", "Vector DB", "Admin UI"
        ],
        flowData: {
            nodes: [
                { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { title: 'Camera Feed', label: 'Input' } },
                { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { title: 'Face Detector', label: 'OpenCV' } },
                { id: '3', type: 'custom', position: { x: 250, y: 200 }, data: { title: 'Liveness Check', label: 'Depth Analysis' } },
                { id: '4', type: 'custom', position: { x: 250, y: 300 }, data: { title: 'Feature Extractor', label: 'ONNX Model' } },
                { id: '5', type: 'custom', position: { x: 50, y: 400 }, data: { title: 'Vector DB', label: 'FAISS' } },
                { id: '6', type: 'custom', position: { x: 450, y: 400 }, data: { title: 'Admin UI', label: 'Dashboard' } }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e4-6', source: '4', target: '6', animated: true, style: { stroke: '#00F0FF' } },
            ]
        },
        engineeringDecisions: [
            {
                decision: "Used ONNX Runtime",
                why: "To optimize model inference speed on CPU/edge devices.",
                impact: "Achieved 30 FPS processing on standard hardware."
            },
            {
                decision: "FAISS for embedding search",
                why: "To scale identification to thousands of users efficiently.",
                impact: "O(1) lookup time for user identification."
            }
        ],
        security: [
            "Liveness detection to prevent photo attacks",
            "Encrypted biometric data storage",
            "Local processing privacy focus"
        ],
        results: [
            "Working real-time prototype",
            "High accuracy in variable lighting",
            "Successful anti-spoofing demonstration"
        ],
        links: {
            github: "https://github.com/jadhavgaurav",
            allRepos: "https://github.com/jadhavgaurav"
        }
    },
    {
        title: "KIDNEY DISEASE CLASSIFICATION",
        subtitle: "Deep Learning Medical Imaging",
        description:
            "A CNN-based medical imaging system for kidney disease classification from CT scans, featuring full MLOps lifecycle.",
        tech: ["TensorFlow", "Keras", "Docker", "MLflow", "DVC", "AWS"],
        gridSpan: "col-span-1",
        color: "#D946EF",
        tag: "MAJOR SYSTEM",

        slug: "#kidney-cnn",
        aim: [
            "Classify kidney disease from CT scan images",
            "Implement full MLOps lifecycle"
        ],
        built: [
            "Custom CNN architecture for medical image classification",
            "Data augmentation pipeline",
            "MLOps pipeline with DVC and MLflow",
            "Model serving via Docker container"
        ],
        techStackDetailed: [
            { category: "DL Framework", stack: ["TensorFlow", "Keras"] },
            { category: "MLOps", stack: ["MLflow", "DVC"] },
            { category: "Infrastucture", stack: ["Docker", "AWS"] },
            { category: "Language", stack: ["Python"] }
        ],
        architecture: [
            "Data Ingestion", "Preprocessing", "Training Pipeline", "Model Registry", "Inference API", "Monitoring"
        ],
        flowData: {
            nodes: [
                { id: '1', type: 'custom', position: { x: 50, y: 0 }, data: { title: 'Data Ingestion', label: 'DVC' } },
                { id: '2', type: 'custom', position: { x: 250, y: 0 }, data: { title: 'Preprocessing', label: 'Augmentation' } },
                { id: '3', type: 'custom', position: { x: 450, y: 0 }, data: { title: 'Training', label: 'Keras CNN' } },
                { id: '4', type: 'custom', position: { x: 450, y: 100 }, data: { title: 'Model Registry', label: 'MLflow' } },
                { id: '5', type: 'custom', position: { x: 250, y: 100 }, data: { title: 'Inference API', label: 'FastAPI' } },
                { id: '6', type: 'custom', position: { x: 50, y: 100 }, data: { title: 'Monitoring', label: 'Prometheus' } }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#D946EF' } },
            ]
        },
        engineeringDecisions: [
            {
                decision: "Implemented Transfer Learning",
                why: "To leverage pre-trained features for better accuracy with limited medical data.",
                impact: "95% accuracy achieved with smaller dataset."
            },
            {
                decision: "DVC for data versioning",
                why: "To ensure reproducibility of experiments across different data versions.",
                impact: "Full traceability of model lineage."
            }
        ],
        security: [
            "Model endpoint authentication",
            "Secure data handling practices",
            "Container scanning"
        ],
        results: [
            "High accuracy model trained and versioned",
            "Reproducible training pipeline",
            "Containerized inference service"
        ],
        links: {
            github: "https://github.com/jadhavgaurav",
            allRepos: "https://github.com/jadhavgaurav"
        }
    },
    {
        title: "PHISHING DETECTION",
        subtitle: "Machine Learning Security System",
        description:
            "A high-accuracy ML system for phishing URL detection using engineered features, explainable AI, and real-time deployment.",
        tech: ["Python", "Scikit-learn", "XGBoost", "Streamlit", "DVC"],
        gridSpan: "col-span-1",
        color: "#00F0FF",
        tag: "MAJOR SYSTEM",

        slug: "#phishing-detection",
        aim: [
            "Detect malicious URLs in real-time",
            "Provide explainable risk scores"
        ],
        built: [
            "Feature engineering pipeline for URL characteristics",
            "Ensemble ML model training",
            "Streamlit dashboard for analysis",
            "API for integration"
        ],
        techStackDetailed: [
            { category: "ML", stack: ["Scikit-learn", "XGBoost"] },
            { category: "Frontend", stack: ["Streamlit"] },
            { category: "Language", stack: ["Python"] },
            { category: "Version Control", stack: ["DVC"] }
        ],
        architecture: [
            "URL Input", "Feature Extractor", "ML Classifier", "Explanation Engine", "Result Dashboard"
        ],
        flowData: {
            nodes: [
                { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { title: 'URL Input', label: 'User Data' } },
                { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { title: 'Feature Extractor', label: 'Lexical' } },
                { id: '3', type: 'custom', position: { x: 250, y: 200 }, data: { title: 'ML Classifier', label: 'XGBoost' } },
                { id: '4', type: 'custom', position: { x: 50, y: 300 }, data: { title: 'Explanation', label: 'SHAP' } },
                { id: '5', type: 'custom', position: { x: 450, y: 300 }, data: { title: 'Dashboard', label: 'Streamlit' } }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e3-5', source: '3', target: '5', animated: true, style: { stroke: '#00F0FF' } },
            ]
        },
        engineeringDecisions: [
            {
                decision: "XGBoost Algorithm",
                why: "Chosen for its high performance on tabular data and speed.",
                impact: "Best in class accuracy for feature-based detection."
            },
            {
                decision: "Feature Engineering focus",
                why: "Lexical features proved more robust than raw text payload for URLs.",
                impact: "System remains effective against new domain generation algorithms."
            }
        ],
        security: [
            "Secure API endpoints",
            "Input validation",
            "Rate limiting"
        ],
        results: [
            "Fast inference time <50ms",
            "Precision >96% on test set",
            "Interactive explanation dashboard"
        ],
        links: {
            github: "https://github.com/jadhavgaurav",
            allRepos: "https://github.com/jadhavgaurav"
        }
    },
    {
        title: "MULTIMODAL SEARCH PLATFORM",
        subtitle: "Semantic Search with CLIP & Vector DB",
        description:
            "A full-stack semantic search engine enabling text-to-image and image-to-image retrieval using CLIP embeddings and ChromaDB, with a React frontend and FastAPI backend.",
        tech: ["FastAPI", "React", "CLIP", "ChromaDB", "Docker"],
        gridSpan: "col-span-1",
        color: "#00F0FF",
        tag: "MAJOR SYSTEM",

        slug: "#multimodal-search",
        statusPill: "Major",
        aim: [
            "Enable semantic search across text and image modalities",
            "Build scalable vector search with nearest-neighbour retrieval",
            "Containerize full stack for reproducible deployment"
        ],
        built: [
            "CLIP embedding pipeline for unified text/image vector space",
            "ChromaDB vector store for fast similarity search",
            "FastAPI backend with async search endpoints",
            "React 18 frontend with Vite for instant search UI",
            "Docker Compose orchestration for full stack"
        ],
        techStackDetailed: [
            { category: "AI/Embeddings", stack: ["CLIP", "Sentence-Transformers"] },
            { category: "Vector DB", stack: ["ChromaDB"] },
            { category: "Backend", stack: ["FastAPI", "Python"] },
            { category: "Frontend", stack: ["React 18", "Vite", "TypeScript"] },
            { category: "Infra", stack: ["Docker", "Docker Compose"] }
        ],
        architecture: [
            "React UI", "FastAPI Gateway", "CLIP Encoder", "ChromaDB Store", "Similarity Ranker", "Result Renderer"
        ],
        flowData: {
            nodes: [
                { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { title: 'React UI', label: 'Search Interface' } },
                { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { title: 'FastAPI', label: 'API Gateway' } },
                { id: '3', type: 'custom', position: { x: 250, y: 200 }, data: { title: 'CLIP Encoder', label: 'Embedding Model' } },
                { id: '4', type: 'custom', position: { x: 50, y: 300 }, data: { title: 'ChromaDB', label: 'Vector Store' } },
                { id: '5', type: 'custom', position: { x: 450, y: 300 }, data: { title: 'Ranker', label: 'Similarity Sort' } },
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e3-5', source: '3', target: '5', animated: true, style: { stroke: '#00F0FF' } },
            ]
        },
        engineeringDecisions: [
            {
                decision: "CLIP for joint embedding space",
                why: "CLIP maps both text and images into the same vector space, enabling true cross-modal search without separate models.",
                impact: "Single embedding pipeline handles both query types, halving infrastructure complexity."
            },
            {
                decision: "ChromaDB over Pinecone",
                why: "Self-hosted ChromaDB eliminates API costs and latency, suitable for local/private deployments.",
                impact: "Zero external API dependency, full control over data and query performance."
            }
        ],
        security: [
            "Input validation on all search endpoints",
            "Rate limiting on FastAPI routes",
            "No PII stored in vector metadata"
        ],
        results: [
            "Sub-100ms search latency on local hardware",
            "Cross-modal retrieval (text→image and image→image)",
            "Containerized — one-command deployment"
        ],
        links: {
            github: "https://github.com/jadhavgaurav/multimodal-search-platform",
            allRepos: "https://github.com/jadhavgaurav/multimodal-search-platform"
        }
    },
    {
        title: "SMART EMAIL ASSISTANT",
        subtitle: "AI Email Classification & Auto-Response",
        description:
            "A local AI-powered email management system achieving 94% classification accuracy with automated response generation using LLaMA3 8B via Ollama, no cloud dependency.",
        tech: ["Python", "LangChain", "Ollama", "Streamlit", "Docker"],
        gridSpan: "col-span-1",
        color: "#D946EF",
        tag: "AI/ML",

        slug: "#smart-email-assistant",
        statusPill: "Major",
        aim: [
            "Classify incoming emails by type and urgency at high accuracy",
            "Auto-generate context-aware reply drafts",
            "Run entirely on local LLM — no data leaves the machine"
        ],
        built: [
            "scikit-learn classification pipeline (94% accuracy)",
            "LLaMA3 8B integration via Ollama for response generation",
            "LangChain orchestration for prompt routing",
            "Escalation mechanism for low-confidence predictions",
            "Streamlit dashboard for review and approval workflow",
            "Docker containerization for reproducible deployment"
        ],
        techStackDetailed: [
            { category: "ML", stack: ["scikit-learn", "Python"] },
            { category: "LLM", stack: ["LLaMA3 8B", "Ollama", "LangChain"] },
            { category: "UI", stack: ["Streamlit"] },
            { category: "Infra", stack: ["Docker"] }
        ],
        architecture: [
            "Email Input", "Classifier", "Confidence Router", "LLM Generator", "Escalation Handler", "Streamlit Review"
        ],
        flowData: {
            nodes: [
                { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { title: 'Email Input', label: 'Raw Text' } },
                { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { title: 'Classifier', label: 'scikit-learn' } },
                { id: '3', type: 'custom', position: { x: 50, y: 200 }, data: { title: 'High Confidence', label: 'Auto Route' } },
                { id: '4', type: 'custom', position: { x: 450, y: 200 }, data: { title: 'Low Confidence', label: 'Escalate' } },
                { id: '5', type: 'custom', position: { x: 50, y: 300 }, data: { title: 'LLM Generator', label: 'LLaMA3 via Ollama' } },
                { id: '6', type: 'custom', position: { x: 250, y: 400 }, data: { title: 'Streamlit UI', label: 'Review & Approve' } },
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e3-5', source: '3', target: '5', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e4-6', source: '4', target: '6', animated: true, style: { stroke: '#D946EF' } },
            ]
        },
        engineeringDecisions: [
            {
                decision: "Local LLM via Ollama instead of OpenAI",
                why: "Email content is sensitive — running LLaMA3 locally ensures no data leaves the machine.",
                impact: "Zero API costs, full data privacy, works offline."
            },
            {
                decision: "Confidence-based escalation",
                why: "Low-confidence predictions are flagged for human review rather than auto-responded to.",
                impact: "Prevents incorrect automated replies on ambiguous emails."
            }
        ],
        security: [
            "No email data sent to external APIs",
            "Local-only LLM inference via Ollama",
            "Human-in-the-loop for low-confidence cases"
        ],
        results: [
            "94% email classification accuracy",
            "Automated drafts reduce response time by ~70%",
            "Fully self-hosted — zero cloud dependency"
        ],
        links: {
            github: "https://github.com/jadhavgaurav/smart-email-assistant-newel",
            allRepos: "https://github.com/jadhavgaurav/smart-email-assistant-newel"
        }
    },
    {
        title: "E-VOTING BLOCKCHAIN",
        subtitle: "Decentralized Voting with Face Recognition Auth",
        description:
            "A tamper-proof e-voting platform combining Ethereum smart contracts for immutable vote recording with face recognition biometrics for secure voter authentication.",
        tech: ["Solidity", "Ethereum", "Python/Flask", "Face Recognition", "PHP"],
        gridSpan: "col-span-1",
        color: "#00F0FF",
        tag: "BLOCKCHAIN",

        slug: "#evoting-blockchain",
        statusPill: "Major",
        aim: [
            "Prevent vote tampering via immutable blockchain ledger",
            "Replace password auth with biometric face recognition",
            "Provide real-time transparent vote counting"
        ],
        built: [
            "Solidity smart contracts for vote storage on Ethereum",
            "Truffle/Ganache local blockchain development environment",
            "Python/Flask facial recognition authentication service",
            "PHP/MySQL admin dashboard for election management",
            "Real-time results display with candidate analytics"
        ],
        techStackDetailed: [
            { category: "Blockchain", stack: ["Solidity 0.8", "Ethereum", "Truffle", "Ganache"] },
            { category: "Biometrics", stack: ["Python", "Flask", "Face Recognition"] },
            { category: "Web", stack: ["PHP", "MySQL", "JavaScript", "jQuery"] },
            { category: "Frontend", stack: ["HTML5", "CSS3"] }
        ],
        architecture: [
            "Voter Auth (Face)", "Smart Contract", "Ethereum Node", "Vote Ledger", "Admin Dashboard", "Results View"
        ],
        flowData: {
            nodes: [
                { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { title: 'Voter Portal', label: 'Web UI' } },
                { id: '2', type: 'custom', position: { x: 50, y: 100 }, data: { title: 'Face Auth', label: 'Python/Flask' } },
                { id: '3', type: 'custom', position: { x: 450, y: 100 }, data: { title: 'Smart Contract', label: 'Solidity' } },
                { id: '4', type: 'custom', position: { x: 450, y: 200 }, data: { title: 'Ethereum Node', label: 'Ganache' } },
                { id: '5', type: 'custom', position: { x: 250, y: 300 }, data: { title: 'Admin Dashboard', label: 'PHP' } },
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#00F0FF' } },
                { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#00F0FF' } },
            ]
        },
        engineeringDecisions: [
            {
                decision: "Ethereum smart contracts for vote storage",
                why: "Blockchain immutability ensures no vote can be altered after submission.",
                impact: "Cryptographic proof of each vote, publicly verifiable results."
            },
            {
                decision: "Face recognition over OTP/password",
                why: "Biometrics prevent identity fraud and voter impersonation more robustly than credentials.",
                impact: "Each voter uniquely authenticated before ballot access is granted."
            }
        ],
        security: [
            "Immutable vote records on blockchain",
            "Biometric identity verification",
            "Smart contract access control",
            "No vote modification after submission"
        ],
        results: [
            "End-to-end voting flow on local Ethereum network",
            "Face recognition authentication working in real-time",
            "Transparent real-time results dashboard"
        ],
        links: {
            github: "https://github.com/jadhavgaurav/E-Voting-using-Blockchain-and-Face-Recognition",
            allRepos: "https://github.com/jadhavgaurav/E-Voting-using-Blockchain-and-Face-Recognition"
        }
    },
    {
        title: "FINANCE DASHBOARD",
        subtitle: "Flutter Mobile App — Clean Architecture",
        description:
            "A production-quality Flutter finance operations app featuring KPI dashboards, cashflow visualization, vendor management, and approval workflows built with Clean Architecture and Riverpod.",
        tech: ["Flutter", "Dart", "Riverpod", "GoRouter", "fl_chart"],
        gridSpan: "col-span-1",
        color: "#D946EF",
        tag: "MOBILE",

        slug: "#finance-dashboard",
        statusPill: "Major",
        aim: [
            "Build a professional-grade finance ops mobile app",
            "Implement Feature-First Clean Architecture for scalability",
            "Visualize cashflow and KPIs with interactive charts"
        ],
        built: [
            "Feature-First Clean Architecture with domain/data/presentation layers",
            "Riverpod state management for reactive UI",
            "GoRouter for declarative navigation",
            "fl_chart integration for cashflow and KPI visualizations",
            "Vendor management and approval workflow screens",
            "JSON serialization with code generation"
        ],
        techStackDetailed: [
            { category: "Framework", stack: ["Flutter", "Dart"] },
            { category: "State", stack: ["Riverpod"] },
            { category: "Navigation", stack: ["GoRouter"] },
            { category: "Charts", stack: ["fl_chart"] },
            { category: "Architecture", stack: ["Clean Architecture", "Feature-First"] }
        ],
        architecture: [
            "Presentation Layer", "Domain Layer", "Data Layer", "Riverpod Providers", "GoRouter Nav", "fl_chart Widgets"
        ],
        flowData: {
            nodes: [
                { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { title: 'Flutter UI', label: 'Presentation' } },
                { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { title: 'Riverpod', label: 'State Layer' } },
                { id: '3', type: 'custom', position: { x: 50, y: 200 }, data: { title: 'Domain', label: 'Use Cases' } },
                { id: '4', type: 'custom', position: { x: 450, y: 200 }, data: { title: 'Data', label: 'Repositories' } },
                { id: '5', type: 'custom', position: { x: 250, y: 300 }, data: { title: 'GoRouter', label: 'Navigation' } },
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e1-5', source: '1', target: '5', animated: true, style: { stroke: '#D946EF' } },
            ]
        },
        engineeringDecisions: [
            {
                decision: "Feature-First Clean Architecture",
                why: "Organizes code by feature (not layer) making it easy to add/remove features without touching unrelated code.",
                impact: "Each feature is independently testable and deployable."
            },
            {
                decision: "Riverpod over BLoC",
                why: "Riverpod offers simpler syntax with full compile-time safety and no boilerplate streams.",
                impact: "Less code, fewer bugs, easier to onboard contributors."
            }
        ],
        security: [
            "Input validation on all financial form fields",
            "Role-based approval workflow for transactions",
            "No sensitive data persisted in plain text"
        ],
        results: [
            "Professional finance ops UI across iOS and Android",
            "Fully navigable with deep-link support via GoRouter",
            "Scalable architecture ready for backend integration"
        ],
        links: {
            github: "https://github.com/jadhavgaurav/finance-dashboard",
            allRepos: "https://github.com/jadhavgaurav/finance-dashboard"
        }
    },
    {
        title: "FYNIX DIGITAL",
        subtitle: "Creative Agency Platform",
        description:
            "A modern, high-performance agency website focused on UI/UX excellence, animation, and branding.",
        tech: ["Next.js", "React", "Tailwind", "Framer Motion"],
        gridSpan: "col-span-1",
        color: "#D946EF",
        tag: "FEATURED",

        slug: "#fynix-digital",
        aim: [
            "Create high-impact digital presence",
            "Showcase agency portfolio with smooth animations"
        ],
        built: [
            "Interactive landing page with scroll animations",
            "Performance optimized image loading",
            "Custom design system implementation",
            "Responsive mobile layout"
        ],
        techStackDetailed: [
            { category: "Frontend", stack: ["React", "Next.js"] },
            { category: "Styling", stack: ["Tailwind CSS"] },
            { category: "Animation", stack: ["Framer Motion"] },
            { category: "Deployment", stack: ["Vercel"] }
        ],
        architecture: [
            "Next.js App", "CDN", "Image Optimization", "Analytics"
        ],
        flowData: {
            nodes: [
                { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { title: 'Next.js App', label: 'Client' } },
                { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { title: 'Vercel Edge', label: 'Global CDN' } },
                { id: '3', type: 'custom', position: { x: 100, y: 200 }, data: { title: 'Image API', label: 'Optimization' } },
                { id: '4', type: 'custom', position: { x: 400, y: 200 }, data: { title: 'Analytics', label: 'Data' } }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#D946EF' } },
                { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#D946EF' } },
            ]
        },
        engineeringDecisions: [
            {
                decision: "Framer Motion for animations",
                why: "To enable complex, gesture-driven animations with simple declarative code.",
                impact: "Rich user experience with minimal dev overhead."
            },
            {
                decision: "Tailwind CSS",
                why: "For rapid UI development and consistent design tokens.",
                impact: "Consistent branding across all pages."
            }
        ],
        security: [
            "Static site generation security benefits",
            "Dependency auditing",
            "HTTPS enforcement"
        ],
        results: [
            "High Lighthouse performance score",
            "Responsive across all device sizes",
            "Engaging user interactions"
        ],
        links: {
            github: "https://github.com/jadhavgaurav",
            allRepos: "https://github.com/jadhavgaurav"
        }
    },
];
