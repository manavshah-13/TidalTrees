from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
<<<<<<< HEAD
from app.routers import auth, leaderboard, reports, contact
=======
from app.routers import auth, reports
>>>>>>> 5ba0dc3fa90ac3dc07366ebc86c1aebe83062fd9

settings = get_settings()

app = FastAPI(
    title="TidalTrees API",
    description="Mangrove conservation monitoring platform API",
    version="1.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
<<<<<<< HEAD
app.include_router(leaderboard.router)
app.include_router(reports.router)
app.include_router(contact.router)
=======
app.include_router(reports.router)
>>>>>>> 5ba0dc3fa90ac3dc07366ebc86c1aebe83062fd9


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "TidalTrees API"}
