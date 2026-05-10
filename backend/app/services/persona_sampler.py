import pandas as pd
from pathlib import Path
from app.core.config import settings
from app.models.schemas import TargetCondition, PersonaInfo


_df: pd.DataFrame | None = None


def _load_dataset() -> pd.DataFrame:
    """Nemotron-Personas-Korea 데이터셋 로딩 (최초 1회)"""
    global _df
    if _df is None:
        path = Path(settings.PERSONAS_PATH)
        if not path.exists():
            raise FileNotFoundError(
                f"데이터셋을 찾을 수 없습니다: {path}\n"
                "다운로드: huggingface-cli download nvidia/Nemotron-Personas-Korea --local-dir app/data/"
            )
        _df = pd.read_parquet(path)
    return _df


def sample_personas(condition: TargetCondition) -> list[PersonaInfo]:
    """조건에 맞는 페르소나 N명을 샘플링"""
    df = _load_dataset()

    # 필터링
    mask = (df["age"] >= condition.age_min) & (df["age"] <= condition.age_max)

    if condition.gender:
        mask &= df["sex"] == condition.gender

    if condition.province:
        mask &= df["province"] == condition.province

    if condition.occupation:
        mask &= df["occupation"].str.contains(condition.occupation, na=False)

    if condition.education_level:
        mask &= df["education_level"] == condition.education_level

    filtered = df[mask]

    if len(filtered) == 0:
        raise ValueError("조건에 맞는 페르소나가 없습니다. 조건을 완화해주세요.")

    # 샘플링 (조건에 맞는 것보다 요청 수가 많으면 전체 반환)
    n = min(condition.persona_count, len(filtered))
    sampled = filtered.sample(n=n, random_state=None)

    personas = []
    for _, row in sampled.iterrows():
        personas.append(
            PersonaInfo(
                persona_id=str(row.get("uuid", "")),
                age=int(row["age"]),
                sex=row["sex"],
                province=row["province"],
                district=row.get("district", ""),
                occupation=row.get("occupation", ""),
                education_level=row.get("education_level", ""),
                persona=row.get("persona", ""),
                hobbies_and_interests=row.get("hobbies_and_interests", ""),
                cultural_background=row.get("cultural_background", ""),
                family_type=row.get("family_type", ""),
            )
        )

    return personas


def get_dataset_stats() -> dict:
    """데이터셋 기본 통계 반환"""
    df = _load_dataset()
    return {
        "total_count": len(df),
        "age_range": {"min": int(df["age"].min()), "max": int(df["age"].max())},
        "provinces": sorted(df["province"].unique().tolist()),
        "gender_distribution": df["sex"].value_counts().to_dict(),
    }
