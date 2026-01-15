# sumitup-ai-meet
SumitUp is an AI Powered Meeting Assistant that is helpful for small businesses, universities and interviewers who not only want meetings summary but clarity. Not only action items but tasks that are actually doable, not only summary but visual summaries.

This is the official repo for contributing. To get started first understand the modular parts of the code.

## For team those who have no understanding in what these folders are

```bash
sumitup-ai-meet/
├── backend/                # FastAPI / Python backend service
│   ├── auth/               # Authentication logic
│   ├── config/             # Environment & App configurations
│   ├── core/               # Main business logic
│   ├── controllers/        # API Endpoints
│   ├── database/           # Database connection and setup
│   ├── pipelines/          # LLM Orchestration Pipelines such as Summarization, RAG
│   ├── integrations/       # External APIs (Zoom, Google Meet, etc.)
│   ├── middlewares/        # Rate Limiting Config
│   ├── models/             # Pydantic models for data validation
│   └── integrations/       # Integrations with services such as Email, WhatsApp, Slack in future work
├── frontend/
│   └── client/             # React.js frontend application (Typescript + Tailwind Configured)
├── .gitignore              # Git ignore file
└── README.md               # Current documentation

```

The application is FARM Stack App, Basically (FastAPI as backend, React as Frontend and MongoDB as the DB).
Make sure you have installed nodejs, npm, python and mongodb to get started :)

