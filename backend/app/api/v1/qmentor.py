"""
Q-Mentor API endpoints for AI-powered career guidance
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
import logging

from app.services.qmentor_service import q_mentor_service

logger = logging.getLogger(__name__)

# Constants
QMENTOR_TAG = "Q-Mentor AI"

router = APIRouter(prefix="/qmentor", tags=[QMENTOR_TAG])

# Request/Response Models
class CareerGuidanceRequest(BaseModel):
    query: str
    user_profile: Optional[Dict] = None

class CareerGuidanceResponse(BaseModel):
    response: str
    status: str
    query: str

class QuantumRecommendationRequest(BaseModel):
    career_area: str
    experience_level: str = "beginner"

class QuantumRecommendationResponse(BaseModel):
    recommendations: Dict
    status: str
    career_area: str
    experience_level: str

class LearningPathRequest(BaseModel):
    current_skills: List[str]
    target_role: str

class LearningPathResponse(BaseModel):
    analysis: str
    status: str
    current_skills: List[str]
    target_role: str

@router.post(
    "/guidance",
    response_model=CareerGuidanceResponse,
    summary="Get AI-powered career guidance",
    description="Ask Q-Mentor for personalized career advice and guidance"
)
async def get_career_guidance(request: CareerGuidanceRequest):
    """
    Get AI-powered career guidance from Q-Mentor
    
    Provide a question or request for career advice, optionally with user profile
    for more personalized recommendations.
    """
    try:
        logger.info(f"Q-Mentor guidance request: {request.query}")
        
        result = q_mentor_service.get_career_guidance(
            user_query=request.query,
            user_profile=request.user_profile
        )
        
        return CareerGuidanceResponse(**result)
        
    except Exception as e:
        logger.error(f"Career guidance endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do Q-Mentor. Tente novamente em alguns minutos."
        )

@router.post(
    "/quantum-recommendations",
    response_model=QuantumRecommendationResponse,
    summary="Get quantum-safe career recommendations",
    description="Get specific technology and skill recommendations for quantum-safe careers"
)
async def get_quantum_recommendations(request: QuantumRecommendationRequest):
    """
    Get quantum-safe technology and skill recommendations
    
    Receive targeted recommendations for technologies, skills, courses, and projects
    relevant to your career area in the quantum-safe era.
    """
    try:
        logger.info(f"Quantum recommendations for: {request.career_area}")
        
        result = q_mentor_service.get_quantum_safe_recommendations(
            career_area=request.career_area,
            experience_level=request.experience_level
        )
        
        return QuantumRecommendationResponse(**result)
        
    except Exception as e:
        logger.error(f"Quantum recommendations endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro ao gerar recomendações quântico-seguras."
        )

@router.post(
    "/learning-path",
    response_model=LearningPathResponse,
    summary="Analyze learning path to target role",
    description="Get detailed analysis of skills gap and learning path to your target career role"
)
async def analyze_learning_path(request: LearningPathRequest):
    """
    Analyze learning path from current skills to target role
    
    Provide your current skills and target role to receive a detailed analysis
    of the learning path, skill gaps, and specific steps to achieve your goal.
    """
    try:
        logger.info(f"Learning path analysis: {request.current_skills} -> {request.target_role}")
        
        result = q_mentor_service.analyze_learning_path(
            current_skills=request.current_skills,
            target_role=request.target_role
        )
        
        return LearningPathResponse(**result)
        
    except Exception as e:
        logger.error(f"Learning path endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro na análise do caminho de aprendizado."
        )

@router.get(
    "/health",
    summary="Check Q-Mentor service health",
    description=f"Check if {QMENTOR_TAG} service is available and operational"
)
async def check_qmentor_health():
    """
    Check Q-Mentor service health and availability
    """
    try:
        # Simple health check by testing if model is configured
        is_available = q_mentor_service.model is not None
        
        return {
            "service": QMENTOR_TAG,
            "status": "operational" if is_available else "limited",
            "available": is_available,
            "message": "Q-Mentor está funcionando normalmente" if is_available else "Q-Mentor com funcionalidade limitada - verifique configuração da API"
        }
        
    except Exception as e:
        logger.error(f"Q-Mentor health check error: {e}")
        return {
            "service": QMENTOR_TAG,
            "status": "error",
            "available": False,
            "message": f"Erro no Q-Mentor: {str(e)}"
        }

@router.get(
    "/quick-tips/{career_area}",
    summary="Get quick career tips",
    description="Get quick tips and insights for a specific career area"
)
async def get_quick_tips(career_area: str):
    """
    Get quick career tips for a specific area
    
    Receive immediate, actionable tips and insights for your career area.
    """
    try:
        # Use the general guidance service with a structured query
        quick_query = f"Dê 3 dicas rápidas e práticas para alguém na área de {career_area} considerando tecnologias quântico-seguras"
        
        result = q_mentor_service.get_career_guidance(
            user_query=quick_query,
            user_profile={"career_area": career_area}
        )
        
        return {
            "career_area": career_area,
            "tips": result["response"],
            "status": result["status"]
        }
        
    except Exception as e:
        logger.error(f"Quick tips endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro ao gerar dicas rápidas."
        )