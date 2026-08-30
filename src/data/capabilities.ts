
export interface Skill {
    name: string;
    projectId?: string; // Optional project reference
    description?: string; // Optional 1-line descriptor if needed
}

export interface CapabilityCategory {
    category: string;
    projectBadge?: string; // e.g. "Victus", "AlsoNotify"
    core: Skill[];
    proficient: Skill[];
    familiar: Skill[];
}

export const capabilitiesData: CapabilityCategory[] = [
    {
        category: "AI Engineering",
        projectBadge: "Victus",
        core: [
            { name: "Python", projectId: "Victus" },
            { name: "LangChain", projectId: "Victus" },
            { name: "RAG", projectId: "Victus" },
            { name: "Prompt Engineering" },
            { name: "Vector Search", projectId: "Victus" },
        ],
        proficient: [
            { name: "TensorFlow" },
            { name: "PyTorch" },
            { name: "Transformers" },
            { name: "Embeddings" },
            { name: "Model Evaluation" },
        ],
        familiar: [
            { name: "Agents Orchestration Patterns" },
            { name: "Re-ranking Concepts" },
            { name: "Tool Calling Design" },
        ],
    },
    {
        category: "Backend Engineering",
        projectBadge: "Victus, AlsoNotify",
        core: [
            { name: "FastAPI", projectId: "Victus" },
            { name: "REST APIs" },
            { name: "Async Python" },
            { name: "Auth Patterns" },
            { name: "API Design" },
        ],
        proficient: [
            { name: "Caching" },
            { name: "Background Jobs" },
            { name: "Rate Limiting" },
            { name: "Webhooks" },
        ],
        familiar: [
            { name: "gRPC Concepts" },
            { name: "WebSockets Concepts" },
        ],
    },
    {
        category: "Frontend Engineering",
        projectBadge: "AlsoNotify, Fynix",
        core: [
            { name: "Next.js", projectId: "AlsoNotify" },
            { name: "React" },
            { name: "UI Systems" },
            { name: "Component Architecture" },
        ],
        proficient: [
            { name: "Framer Motion" },
            { name: "Tailwind CSS" },
            { name: "Responsive Layouts" },
        ],
        familiar: [
            { name: "Three.js Concepts" },
            { name: "R3F Concepts" },
            { name: "Accessibility Audits" },
        ],
    },
    {
        category: "Data and Storage",
        core: [
            { name: "Redis" },
            { name: "Vector Stores Concepts" },
            { name: "Data Modeling" },
        ],
        proficient: [
            { name: "SQL Basics" },
            { name: "Indexing Concepts" },
            { name: "ETL Basics" },
        ],
        familiar: [
            { name: "Postgres Performance Tuning Concepts" },
            { name: "Observability Data Schemas" },
        ],
    },
    {
        category: "MLOps and Deployment",
        projectBadge: "Kidney CNN",
        core: [
            { name: "Docker" },
            { name: "Environment Management" },
            { name: "Deployment Workflows" },
        ],
        proficient: [
            { name: "AWS Basics" },
            { name: "MLflow" },
            { name: "DVC" },
            { name: "CI CD Concepts" },
        ],
        familiar: [
            { name: "Container Hardening Concepts" },
            { name: "IaC Concepts" },
        ],
    },
    {
        category: "Computer Vision",
        projectBadge: "Vision-X",
        core: [
            { name: "OpenCV", projectId: "Vision-X" },
            { name: "Face Recognition Pipelines", projectId: "Vision-X" },
        ],
        proficient: [
            { name: "Anti Spoofing Concepts" },
            { name: "ONNX Basics" },
            { name: "Real Time Inference Concepts" },
        ],
        familiar: [
            { name: "Tracking Concepts" },
            { name: "Re Identification Concepts" },
        ],
    },
    {
        category: "Security and Reliability",
        projectBadge: "Phishing Detection",
        core: [
            { name: "Input Validation" },
            { name: "Secrets Handling Basics" },
            { name: "Error Handling" },
        ],
        proficient: [
            { name: "Logging and Monitoring Concepts" },
            { name: "Threat Modeling Basics" },
            { name: "Secure Auth Patterns" },
        ],
        familiar: [
            { name: "OWASP Top 10 Awareness" },
            { name: "Security Testing Concepts" },
        ],
    },
];
