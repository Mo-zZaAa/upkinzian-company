# 업킨지앤 컴퍼니 (Upkinzian Company)

한국인 페르소나 데이터를 기반으로 제품/서비스에 대한 가상 소비자 반응을 생성하고 분석하는 **AI 시장조사 시뮬레이터**

## 핵심 기술

- **Upstage Solar Pro 2**: 한국어 특화 LLM으로 페르소나 응답 생성 + 인사이트 분석
- **Nemotron-Personas-Korea**: NVIDIA의 100만 한국인 합성 페르소나 데이터셋 (CC BY 4.0)

## 빠른 시작

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env  # API 키 설정
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev  # localhost:3000
```

### 데이터셋 다운로드

```bash
pip install huggingface_hub
huggingface-cli download nvidia/Nemotron-Personas-Korea --local-dir backend/app/data/
```

## 팀

| 이름 | GitHub | 역할 |
|------|--------|------|
| 최재영 | @Jaeyeong-CHOI | - |
| 최현 | @choihyun-1110 | - |
| 김세은 | @Mo-zZaAa | - |

## 라이선스

- 코드: MIT
- 데이터셋 (Nemotron-Personas-Korea): CC BY 4.0 (NVIDIA)
