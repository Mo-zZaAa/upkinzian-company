# CLAUDE.md - 업킨지앤 컴퍼니

## 프로젝트 개요
한국인 페르소나 기반 AI 시장조사 시뮬레이터. Nemotron-Personas-Korea + Upstage Solar.

## 기술 스택
- Frontend: Next.js 14 (App Router) + Tailwind CSS
- Backend: FastAPI (Python 3.11+)
- AI: Upstage Solar Pro 2 (OpenAI 호환 API)
- Dataset: nvidia/Nemotron-Personas-Korea (Parquet, 100만 행)

## 핵심 규칙
- 외부 의존 최소화: DB 없음 (인메모리), 큐 없음 (asyncio)
- Upstage Solar API가 핵심. 모든 텍스트 생성은 Solar로.
- 비교 실험용으로만 GPT/Gemini 호출 허용
- 한국어 구어체, 자연스러운 페르소나 응답이 핵심 가치

## 주요 경로
- `backend/app/services/solar_client.py` - Solar API 호출
- `backend/app/services/persona_sampler.py` - 데이터셋 필터링/샘플링
- `backend/app/services/simulation_engine.py` - 비동기 시뮬레이션 오케스트레이터
- `backend/app/services/report_generator.py` - 인사이트 리포트 생성
- `shared/prompts/` - 프롬프트 템플릿

## 코딩 스타일
- Python: Black formatter, type hints 사용
- TypeScript: Prettier, strict mode
- 커밋 메시지: 한국어 OK
