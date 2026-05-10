from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    UPSTAGE_API_KEY: str = ""
    UPSTAGE_BASE_URL: str = "https://api.upstage.ai/v1/solar"
    UPSTAGE_MODEL: str = "solar-pro2"

    # 비교 실험용 (선택)
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    # 데이터셋 경로
    PERSONAS_PATH: str = "app/data/personas.parquet"

    # 시뮬레이션 설정
    MAX_CONCURRENT_CALLS: int = 10
    MAX_PERSONAS: int = 100

    class Config:
        env_file = ".env"


settings = Settings()
