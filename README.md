# sumitup-ai-meet
SumitUp is an AI Powered SaaS and Meeting Assistant , that manages meetings effectively and helpful for different organizations of any size.

## For team those who have no understanding in what these folders are

```bash
SumitUp/
│
├── client/          # React frontend for user interface
│
├── db/              # MongoDB connection and utilities
│
├── auth/            # Handles user authentication and authorization
│
├── integrations/    # External service integrations (Zoom, Google Meet, Microsoft Teams)
│
├── models/          # Pydantic models for request/response validation
│
├── schemas/         # MongoDB schema definitions and document structure
│
├── config/          # Application configuration, environment variables, constants
│
└── core/            # Core business logic and AI processing layer

```

Make sure create virtual environment before creating your first push in FastAPI

# Instructions:

```bash
python3 -m venv env
source env/bin/activate

```

# For Windows:
```psd1

python -m venv env
env\Scripts\activate.bat # On CMD
env\Scripts\activate # if using Powershell

```

# Installation for React Frontend:

```bash
cd client
npm install
npm run dev

```

# Before Running FastAPI Application, make sure install all dependencies:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

