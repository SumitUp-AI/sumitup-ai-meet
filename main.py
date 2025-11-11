from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Server running on port 8000!"}
