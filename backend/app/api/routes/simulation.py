import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import SimulationRequest, SimulationResult
from app.services.simulation_engine import (
    run_simulation,
    get_simulation,
    stream_simulation,
)

router = APIRouter(prefix="/api/v1", tags=["simulation"])


@router.post("/simulate")
async def create_simulation(request: SimulationRequest):
    """시뮬레이션 생성 및 시작"""
    try:
        sim_id = await run_simulation(request)
        return {"simulation_id": sim_id, "status": "running"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/simulate/{sim_id}")
async def get_simulation_status(sim_id: str):
    """시뮬레이션 상태 및 결과 조회"""
    result = get_simulation(sim_id)
    if not result:
        raise HTTPException(status_code=404, detail="시뮬레이션을 찾을 수 없습니다")
    return result


@router.get("/simulate/{sim_id}/stream")
async def stream_simulation_progress(sim_id: str):
    """SSE로 실시간 진행 상황 스트리밍"""

    async def event_generator():
        async for event in stream_simulation(sim_id):
            yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.get("/simulate/{sim_id}/report")
async def get_report(sim_id: str):
    """인사이트 리포트 조회"""
    result = get_simulation(sim_id)
    if not result:
        raise HTTPException(status_code=404, detail="시뮬레이션을 찾을 수 없습니다")
    if not result.report:
        raise HTTPException(status_code=202, detail="리포트 생성 중입니다")
    return result.report
