# sumitup-ai-meet
SumitUp is an AI Powered SaaS and Meeting Assistant , that manages meetings effectively and helpful for different organizations of any size.

## For team those who have no understanding in what these folders are

-- config (the config for api keys)
-- middleware (for middlewares)
-- models (for MongoDB Dict serializers and deserializers)
-- schemas (for MongoDB Schema)
-- core (the business logic, AI Layer)
-- db (connection configuration for MongoDB)
-- client (the app frontend)

Make sure create virtual environment before creating your first push in FastAPI

# Instructions:

```bash
python3 -m venv env
source env/bin/activate

```

# For Windows:
```bat

python -m venv env
env\bin\activate.bat # On CMD
env\bin\activate # if using Powershell

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

