from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import simulation, personas

app = FastAPI(
    title="업킨지앤 컴퍼니 API",
    description="한국인 페르소나 기반 AI 시장조사 시뮬레이터",
    version="0.1.0",
)

# CORS 설정 (프론트엔드 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(simulation.router)
app.include_router(personas.router)


@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "service": "upkinzian-company"}
