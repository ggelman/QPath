"""
Q-Mentor AI Service using Google Gemini
Provides intelligent career guidance and quantum-safe learning recommendations
"""
import logging
from typing import List, Dict, Optional
try:
    import google.generativeai as genai  # pylint: disable=import-error
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    genai = None
from app.core.config import settings

logger = logging.getLogger(__name__)

class QMentorService:
    """Q-Mentor AI service for career guidance using Gemini AI"""
    
    def __init__(self):
        self.model = None
        self._configure_gemini()
    
    def _configure_gemini(self):
        """Configure Gemini AI with API key"""
        try:
            if not GENAI_AVAILABLE:
                logger.warning("Google Generative AI package not available. Install with: pip install google-generativeai")
                return
                
            api_key = settings.GOOGLE_AI_API_KEY or settings.GEMINI_API_KEY
            if not api_key:
                logger.warning("Gemini API key not found. Q-Mentor will not be available.")
                return
                
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Q-Mentor Gemini AI configured successfully")
            
        except Exception as e:
            logger.error(f"Failed to configure Gemini AI: {e}")
            self.model = None
    
    def get_career_guidance(
        self, 
        user_query: str, 
        user_profile: Optional[Dict] = None
    ) -> Dict[str, str]:
        """
        Provide career guidance based on user query and profile
        
        Args:
            user_query: User's question or request
            user_profile: Optional user profile information
            
        Returns:
            Dict with guidance response
        """
        if not self.model:
            return {
                "response": "Q-Mentor está temporariamente indisponível. Tente novamente mais tarde.",
                "status": "error"
            }
        
        try:
            # Build context-aware prompt
            prompt = self._build_career_prompt(user_query, user_profile)
            
            # Generate response with Gemini
            response = self.model.generate_content(prompt)
            
            return {
                "response": response.text,
                "status": "success",
                "query": user_query
            }
            
        except Exception as e:
            logger.error(f"Q-Mentor guidance error: {e}")
            return {
                "response": "Desculpe, encontrei um problema ao processar sua pergunta. Tente reformular ou tente novamente em alguns minutos.",
                "status": "error"
            }
    
    def get_quantum_safe_recommendations(
        self, 
        career_area: str, 
        experience_level: str = "beginner"
    ) -> Dict[str, any]:
        """
        Get quantum-safe technology recommendations for a career area
        
        Args:
            career_area: Target career area (e.g., "cybersecurity", "software development")
            experience_level: User's experience level
            
        Returns:
            Dict with recommendations
        """
        if not self.model:
            return {
                "recommendations": [],
                "status": "error",
                "message": "Q-Mentor está temporariamente indisponível."
            }
        
        try:
            prompt = f"""
            Como Q-Mentor, um especialista em carreiras quântico-seguras, forneça recomendações específicas para:
            
            Área: {career_area}
            Nível: {experience_level}
            
            Foque em:
            1. Tecnologias quântico-seguras relevantes
            2. Habilidades futuras necessárias
            3. Cursos/certificações recomendados
            4. Projetos práticos para começar
            5. Roadmap de 3-6 meses
            
            Formato de resposta em JSON:
            {{
                "technologies": ["tech1", "tech2"],
                "skills": ["skill1", "skill2"],
                "courses": ["course1", "course2"],
                "projects": ["project1", "project2"],
                "roadmap": ["month1", "month2", "month3"]
            }}
            """
            
            response = self.model.generate_content(prompt)
            
            # Try to parse JSON response
            import json
            try:
                recommendations = json.loads(response.text)
            except (json.JSONDecodeError, ValueError):
                # Fallback to structured text if JSON parsing fails
                recommendations = {
                    "raw_response": response.text,
                    "parsed": False
                }
            
            return {
                "recommendations": recommendations,
                "status": "success",
                "career_area": career_area,
                "experience_level": experience_level
            }
            
        except Exception as e:
            logger.error(f"Quantum-safe recommendations error: {e}")
            return {
                "recommendations": [],
                "status": "error",
                "message": f"Erro ao gerar recomendações: {str(e)}"
            }
    
    def analyze_learning_path(
        self, 
        current_skills: List[str], 
        target_role: str
    ) -> Dict[str, any]:
        """
        Analyze learning path from current skills to target role
        
        Args:
            current_skills: List of user's current skills
            target_role: Desired career role
            
        Returns:
            Dict with learning path analysis
        """
        if not self.model:
            return {
                "analysis": "Q-Mentor indisponível",
                "status": "error"
            }
        
        try:
            skills_text = ", ".join(current_skills)
            
            prompt = f"""
            Como Q-Mentor, analise o gap de habilidades e crie um plano de desenvolvimento:
            
            Habilidades atuais: {skills_text}
            Objetivo: {target_role}
            
            Analise:
            1. Pontos fortes existentes
            2. Gaps principais a preencher
            3. Prioridades de aprendizado
            4. Tempo estimado de transição
            5. Passos específicos e práticos
            
            Seja específico e prático, focando em tecnologias quântico-seguras quando relevante.
            """
            
            response = self.model.generate_content(prompt)
            
            return {
                "analysis": response.text,
                "status": "success",
                "current_skills": current_skills,
                "target_role": target_role
            }
            
        except Exception as e:
            logger.error(f"Learning path analysis error: {e}")
            return {
                "analysis": f"Erro na análise: {str(e)}",
                "status": "error"
            }
    
    def _build_career_prompt(self, user_query: str, user_profile: Optional[Dict]) -> str:
        """Build context-aware prompt for career guidance"""
        
        base_prompt = f"""
        Você é Q-Mentor, um mentor de carreira especializado em tecnologias quântico-seguras e desenvolvimento profissional.
        
        Contexto: Ajude profissionais a navegar suas carreiras considerando o futuro quântico da tecnologia.
        
        Pergunta do usuário: {user_query}
        """
        
        if user_profile:
            profile_context = f"""
            
            Perfil do usuário:
            - Nível de experiência: {user_profile.get('experience_level', 'Não informado')}
            - Área de interesse: {user_profile.get('career_area', 'Não informado')}
            - Objetivos: {user_profile.get('goals', 'Não informado')}
            """
            base_prompt += profile_context
        
        base_prompt += """
        
        Diretrizes para resposta:
        1. Seja prático e específico
        2. Considere a revolução quântica vindoura
        3. Sugira passos concretos
        4. Mantenha tom motivacional e profissional
        5. Limite a resposta a 300 palavras
        """
        
        return base_prompt

# Global instance
q_mentor_service = QMentorService()