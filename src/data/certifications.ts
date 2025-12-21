
export interface Certification {
    id: string;
    title: string;
    issuer: string;
    date: string; // Sortable ISO date string (YYYY-MM) or similar for parsing, but here I'll keep raw string for display and add a sortValue
    displayDate: string;
    tags: string[];
    credentialLink: string;
    skillsCovered?: string[];
}

export const certifications: Certification[] = [
    {
        id: "ibm-dl-tf",
        title: "Deep Learning with TensorFlow",
        issuer: "IBM",
        date: "2025-08-01",
        displayDate: "Aug 2025",
        tags: ["Deep Learning", "TensorFlow", "Neural Networks"],
        credentialLink: "https://www.coursera.org/account/accomplishments/records/A7MJD9ZJ4W5J",
        skillsCovered: ["Convolutional Neural Networks", "Recurrent Neural Networks", "TensorFlow Keras", "Model Deployment"]
    },
    {
        id: "ibm-ml-python",
        title: "Machine Learning with Python",
        issuer: "IBM",
        date: "2025-06-15",
        displayDate: "Jun 2025",
        tags: ["ML", "Python", "Model Training"],
        credentialLink: "https://www.coursera.org/account/accomplishments/records/75D965824555",
        skillsCovered: ["Supervised Learning", "Unsupervised Learning", "SciKit-Learn", "Regression Algorithms"]
    },
    {
        id: "ibm-python-ds",
        title: "Python for Data Science",
        issuer: "IBM",
        date: "2025-06-10",
        displayDate: "Jun 2025",
        tags: ["Python", "Data Science", "Pandas"],
        credentialLink: "https://www.coursera.org/account/accomplishments/records/950137785212",
        skillsCovered: ["Pandas Dataframes", "Numpy Arrays", "Data Cleaning", "Data Manipulation"]
    },
    {
        id: "databricks-genai",
        title: "Generative AI Fundamentals",
        issuer: "Databricks",
        date: "2025-06-01",
        displayDate: "Jun 2025",
        tags: ["GenAI", "LLM Basics", "Foundations"],
        credentialLink: "https://credentials.databricks.com/e2e5050f-083b-4770-84c1-90be55030432",
        skillsCovered: ["Large Language Models", "Prompt Engineering", "RAG Concepts", "Generative AI Ethics"]
    },
    {
        id: "forage-ba-ds",
        title: "British Airways Data Science Job Simulation",
        issuer: "Forage",
        date: "2025-04-01",
        displayDate: "Apr 2025",
        tags: ["Data Science", "Prediction", "Analytics"],
        credentialLink: "https://forage-uploads-prod.s3.amazonaws.com/completion-certificates/British%20Airways/NjynKSWRmywsgXhnQ_British%20Airways_tS5h9CdtAgQ5R8Zgq_1714486518770_completion_certificate.pdf",
        skillsCovered: ["Web Scraping", "Predictive Modeling", "Customer Buying Behaviour", "Presentation Skills"]
    },
    {
        id: "ibm-da-python",
        title: "Data Analysis with Python",
        issuer: "IBM",
        date: "2024-10-01",
        displayDate: "Oct 2024",
        tags: ["Data Analysis", "Python", "Visualization"],
        credentialLink: "https://www.coursera.org/account/accomplishments/records/484920409249",
        skillsCovered: ["Matplotlib", "Seaborn", "Exploratory Data Analysis", "Model Development"]
    },
    {
        id: "it-vedant-master-ds",
        title: "Master in Data Science and Analytics with Artificial Intelligence",
        issuer: "IT Vedant",
        date: "2024-06-01",
        displayDate: "Jun 2024 to Jun 2025",
        tags: ["Data Science", "AI", "Applied Analytics"],
        credentialLink: "https://www.itvedant.com/verify-certificate?id=8042456616",
        skillsCovered: ["Full Stack Data Science", "Advanced Machine Learning", "Big Data Technologies", "Capstone Project"]
    }
];
