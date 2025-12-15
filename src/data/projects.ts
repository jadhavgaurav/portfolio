
import { Node, Edge } from '@xyflow/react';

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
        nodes: Node[];
        edges: Edge[];
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
