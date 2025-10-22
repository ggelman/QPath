from fastapi import APIRouter
from app.api.v1 import auth, users, gamification, projects, qmentor, test_db, tracks

# Create main API router
api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["gamification"])
api_router.include_router(tracks.router, prefix="/tracks", tags=["tracks"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(qmentor.router)  # Prefix and tags already defined in qmentor module
api_router.include_router(test_db.router, prefix="/test", tags=["testing"])