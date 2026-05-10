import asyncio
import uuid
from typing import AsyncGenerator
from app.models.schemas import (
    SimulationRequest,
    SimulationResult,
    SimulationStatus,
    PersonaResponse,
)
from app.services.persona_sampler import sample_personas
from app.services.solar_client import generate_persona_response
from app.services.report_generator import generate_insight_report
from app.core.config import settings


# 인메모리 시뮬레이션 저장소 (MVP - DB 불필요)
_simulations: dict[str, SimulationResult] = {}


def get_simulation(sim_id: str) -> SimulationResult | None:
    return _simulations.get(sim_id)


async def run_simulation(request: SimulationRequest) -> str:
    """시뮬레이션 생성 + 백그라운드 실행"""
    sim_id = str(uuid.uuid4())[:8]

    # 페르소나 샘플링
    personas = sample_personas(request.target_condition)

    # 초기 상태 저장
    result = SimulationResult(
        simulation_id=sim_id,
        status=SimulationStatus.RUNNING,
        progress=0,
        total=len(personas),
    )
    _simulations[sim_id] = result

    # 백그라운드에서 실행
    asyncio.create_task(
        _execute_simulation(sim_id, request, personas)
    )

    return sim_id


async def _execute_simulation(sim_id, request, personas):
    """비동기로 모든 페르소나 응답 생성"""
    result = _simulations[sim_id]
    semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_CALLS)

    async def call_with_limit(persona):
        async with semaphore:
            try:
                response = await generate_persona_response(
                    persona=persona,
                    product_description=request.product_description,
                    questions=request.questions,
                )
                result.responses.append(response)
                result.progress = len(result.responses)
                return response
            except Exception as e:
                print(f"[ERROR] 페르소나 {persona.persona_id} 실패: {e}")
                return None

    # 모든 페르소나에 대해 병렬 호출
    tasks = [call_with_limit(p) for p in personas]
    await asyncio.gather(*tasks)

    # 인사이트 리포트 생성
    result.status = SimulationStatus.ANALYZING
    try:
        report = await generate_insight_report(
            product_description=request.product_description,
            responses=result.responses,
        )
        result.report = report
        result.status = SimulationStatus.COMPLETED
    except Exception as e:
        print(f"[ERROR] 리포트 생성 실패: {e}")
        result.status = SimulationStatus.COMPLETED  # 응답은 있으니 완료 처리


async def stream_simulation(sim_id: str) -> AsyncGenerator[dict, None]:
    """SSE용 실시간 진행 상황 스트리밍"""
    result = _simulations.get(sim_id)
    if not result:
        yield {"error": "시뮬레이션을 찾을 수 없습니다"}
        return

    last_progress = 0
    while result.status in (SimulationStatus.RUNNING, SimulationStatus.ANALYZING):
        if result.progress > last_progress:
            # 새로운 응답이 도착했으면 전송
            new_responses = result.responses[last_progress:result.progress]
            for resp in new_responses:
                yield {
                    "type": "response",
                    "progress": result.progress,
                    "total": result.total,
                    "data": resp.model_dump(),
                }
            last_progress = result.progress

        if result.status == SimulationStatus.ANALYZING:
            yield {"type": "status", "message": "인사이트 리포트 생성 중..."}

        await asyncio.sleep(0.5)

    # 완료
    yield {
        "type": "completed",
        "progress": result.total,
        "total": result.total,
        "report": result.report,
    }
