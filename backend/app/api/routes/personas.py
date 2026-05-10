from fastapi import APIRouter, HTTPException
from app.models.schemas import TargetCondition
from app.services.persona_sampler import sample_personas, get_dataset_stats

router = APIRouter(prefix="/api/v1", tags=["personas"])


@router.post("/personas/preview")
async def preview_personas(condition: TargetCondition):
    """조건에 맞는 페르소나 5명 미리보기"""
    condition.persona_count = 5  # 미리보기는 5명만
    try:
        personas = sample_personas(condition)
        return {"count": len(personas), "personas": personas}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/personas/stats")
async def personas_stats():
    """데이터셋 기본 통계"""
    try:
        return get_dataset_stats()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
