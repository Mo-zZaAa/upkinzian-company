# 업킨지앤 컴퍼니 - 아키텍처 설계

## 설계 원칙

**"외부 의존 최소화, Upstage API 중심"**

### 왜 이렇게 설계했는가?

1. **Upstage Solar API만으로 핵심 기능 완성**: 페르소나 응답 생성 + 인사이트 리포트 작성 + 후속 질문 생성 모두 Solar로 처리
2. **별도 DB 없음**: 데모/MVP 단계에서 Redis·PostgreSQL 등 외부 인프라 불필요. 세션 기반 인메모리 처리
3. **별도 큐 시스템 없음**: Celery/RabbitMQ 대신 Python asyncio로 동시성 처리 (MVP에 충분)
4. **배포 단순화**: Frontend(Vercel) + Backend(Railway) 2개면 끝
5. **비용 최소화**: $70 크레딧으로 충분히 데모 가능 (시뮬레이션 1회 ≈ $0.5 이하)

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 (브라우저)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend (Next.js + Tailwind)                    │
│              배포: Vercel                                     │
│                                                              │
│  [입력 폼] → [진행 상황] → [결과 대시보드] → [비교 뷰]        │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API + SSE
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (FastAPI + Python)                       │
│              배포: Railway                                    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ 페르소나      │  │ Solar 응답    │  │ 리포트       │       │
│  │ 샘플러       │  │ 생성 엔진    │  │ 생성기       │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Nemotron     │  │ Upstage      │  │ Upstage      │       │
│  │ Dataset      │  │ Solar API    │  │ Solar API    │       │
│  │ (Parquet)    │  │ (응답 생성)   │  │ (분석/요약)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │ [선택] 비교 실험용 외부 API (GPT/Gemini)           │       │
│  │ → 모델 비교 기능에서만 사용                         │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | SSR/SSG 지원, Vercel 최적화, 빠른 UI 개발 |
| Backend | FastAPI (Python 3.11+) | 비동기 네이티브, OpenAI SDK 호환, 타입 안전 |
| AI Model | Upstage Solar Pro 2 (OpenAI 호환 API) | 한국어 벤치마크 최강, 프로젝트 핵심 |
| Dataset | Nemotron-Personas-Korea (Parquet) | 100만 한국인 페르소나, CC BY 4.0 |
| State | 인메모리 (dict + asyncio.Event) | MVP에 충분, 외부 의존 제거 |
| 배포 | Vercel (FE) + Railway (BE) | 무료 티어 활용, 간단한 CI/CD |

---

## API 설계

```
POST /api/v1/simulate
  → 시뮬레이션 생성 + 백그라운드 실행 시작
  → Returns: { simulation_id, status: "running" }

GET  /api/v1/simulate/{id}
  → 진행 상황 + 완료된 응답 반환
  → Returns: { status, progress, completed_responses[] }

GET  /api/v1/simulate/{id}/stream
  → SSE: 실시간 페르소나 응답 스트리밍

GET  /api/v1/simulate/{id}/report
  → 최종 인사이트 리포트

POST /api/v1/compare
  → Solar vs 타 모델 비교 (선택 기능)

POST /api/v1/personas/preview
  → 조건에 맞는 페르소나 미리보기 (5명 샘플)
```

---

## 데이터 흐름

```
1. 사용자 입력
   ├── 제품/서비스 설명 (text)
   ├── 타겟 조건 (age, gender, region, occupation...)
   ├── 인원수 (10~100)
   └── 질문 목록 (기본 6개 + 커스텀)

2. 페르소나 샘플링
   └── Nemotron Parquet → pandas/polars 필터 → N명 추출

3. Solar 응답 생성 (비동기 병렬)
   └── asyncio.Semaphore(10) → 동시 10개 API 호출
       ├── 페르소나 1 → Solar → JSON 응답
       ├── 페르소나 2 → Solar → JSON 응답
       └── ...N명

4. 응답 수합 + 인사이트 분석
   └── 전체 응답 JSON → Solar 재호출 → 리포트 생성

5. 결과 반환
   ├── 페르소나별 응답 카드
   ├── 통계 대시보드
   └── 자연어 리포트
```

---

## 비용 추정 ($70 크레딧 기준)

| 항목 | 토큰 | 비용/회 | 70$ 내 가능 횟수 |
|------|------|---------|-----------------|
| 페르소나 30명 시뮬레이션 | ~150K tokens | ~$0.15 | ~460회 |
| 페르소나 100명 시뮬레이션 | ~500K tokens | ~$0.50 | ~140회 |
| 인사이트 리포트 생성 | ~50K tokens | ~$0.05 | - |
| 모델 비교 (Solar측) | 동일 | 동일 | - |

→ 개발 + 테스트 + 데모 발표까지 충분.

---

## 폴더 구조

```
upkinzian-company/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # 랜딩 + 입력 폼
│   │   │   ├── simulation/[id]/
│   │   │   │   └── page.tsx          # 진행 + 결과
│   │   │   └── compare/page.tsx      # 모델 비교
│   │   ├── components/
│   │   │   ├── ProductForm.tsx        # 제품 입력 폼
│   │   │   ├── TargetSelector.tsx     # 타겟 조건 설정
│   │   │   ├── PersonaCard.tsx        # 페르소나 응답 카드
│   │   │   ├── InsightDashboard.tsx   # 통계 대시보드
│   │   │   ├── ReportView.tsx         # 리포트 뷰
│   │   │   └── ProgressBar.tsx        # 진행 상황
│   │   ├── lib/
│   │   │   ├── api.ts                # 백엔드 API 클라이언트
│   │   │   └── types.ts             # 공유 타입
│   │   └── hooks/
│   │       └── useSimulation.ts      # SSE 구독 훅
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI 앱
│   │   ├── api/routes/
│   │   │   ├── simulation.py         # 시뮬레이션 엔드포인트
│   │   │   ├── personas.py           # 페르소나 샘플링
│   │   │   └── compare.py            # 모델 비교
│   │   ├── core/
│   │   │   └── config.py             # 환경변수, 설정
│   │   ├── services/
│   │   │   ├── persona_sampler.py    # 데이터셋 로딩 + 필터링
│   │   │   ├── solar_client.py       # Upstage Solar API 래퍼
│   │   │   ├── simulation_engine.py  # 비동기 시뮬레이션 오케스트레이터
│   │   │   └── report_generator.py   # 인사이트 리포트 생성
│   │   ├── models/
│   │   │   └── schemas.py            # Pydantic 모델
│   │   └── data/
│   │       └── (personas.parquet)    # 데이터셋 캐시
│   ├── requirements.txt
│   └── Dockerfile
│
├── shared/
│   └── prompts/
│       ├── persona_response.txt      # 페르소나 응답 생성 프롬프트
│       └── insight_report.txt        # 리포트 생성 프롬프트
│
├── docs/
│   ├── ARCHITECTURE.md               # 본 문서
│   └── UX_DESIGN.md                  # UX 설계
│
├── .env.example
├── .gitignore
├── README.md
└── CLAUDE.md
```
