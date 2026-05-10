from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class TargetCondition(BaseModel):
    age_min: int = 19
    age_max: int = 99
    gender: Optional[str] = None  # "남자" | "여자" | None(전체)
    province: Optional[str] = None
    occupation: Optional[str] = None
    education_level: Optional[str] = None
    persona_count: int = Field(default=30, ge=5, le=100)


class SimulationRequest(BaseModel):
    product_description: str = Field(..., max_length=2000)
    target_condition: TargetCondition
    questions: list[str] = Field(
        default=[
            "이 서비스의 첫인상은 어떤가요?",
            "사용할 의향이 있나요? (1~5점)",
            "가장 마음에 드는 점은 무엇인가요?",
            "가장 걱정되는 점은 무엇인가요?",
            "얼마 정도라면 지불할 의향이 있나요?",
            "주변 사람에게 추천할 것 같나요? (1~5점)",
        ]
    )


class PersonaInfo(BaseModel):
    persona_id: str
    age: int
    sex: str
    province: str
    district: str
    occupation: str
    education_level: str
    persona: str  # 요약 페르소나
    hobbies_and_interests: str
    cultural_background: str
    family_type: str


class PersonaResponse(BaseModel):
    persona_id: str
    persona_info: PersonaInfo
    first_impression: str
    purchase_intent_score: int = Field(ge=1, le=5)
    liked_points: list[str]
    concerns: list[str]
    willingness_to_pay: str
    recommendation_likelihood: int = Field(ge=1, le=5)
    representative_quote: str
    overall_sentiment: str  # "positive" | "neutral" | "negative"


class SimulationStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"


class SimulationResult(BaseModel):
    simulation_id: str
    status: SimulationStatus
    progress: int = 0
    total: int = 0
    responses: list[PersonaResponse] = []
    report: Optional[dict] = None


class CompareRequest(BaseModel):
    product_description: str
    persona_info: PersonaInfo
    questions: list[str]
    models: list[str] = ["solar-pro2", "gpt-4o", "gemini-2.0-flash"]
