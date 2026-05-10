import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.models.schemas import PersonaResponse


async def generate_insight_report(
    product_description: str,
    responses: list[PersonaResponse],
) -> dict:
    """Solar를 호출해 전체 응답을 분석하고 인사이트 리포트 생성"""

    client = AsyncOpenAI(
        api_key=settings.UPSTAGE_API_KEY,
        base_url=settings.UPSTAGE_BASE_URL,
    )

    # 응답 요약 데이터 구성
    responses_summary = []
    for r in responses:
        responses_summary.append({
            "persona": f"{r.persona_info.age}세 {r.persona_info.sex} {r.persona_info.province} {r.persona_info.occupation}",
            "sentiment": r.overall_sentiment,
            "purchase_intent": r.purchase_intent_score,
            "recommendation": r.recommendation_likelihood,
            "liked": r.liked_points,
            "concerns": r.concerns,
            "price": r.willingness_to_pay,
            "quote": r.representative_quote,
        })

    system_prompt = """당신은 시장조사 분석 전문가입니다.
한국인 페르소나들의 제품/서비스 반응 데이터를 분석하여,
마케터와 기획자가 바로 활용할 수 있는 인사이트 리포트를 작성하세요.
출력은 반드시 JSON 형식으로만 작성하세요."""

    user_prompt = f"""## 제품/서비스
{product_description}

## 페르소나 응답 데이터 ({len(responses)}명)
{json.dumps(responses_summary, ensure_ascii=False, indent=2)}

## 작성할 리포트 항목 (JSON)
{{
  "executive_summary": "3-5문장 핵심 요약",
  "sentiment_breakdown": {{
    "positive_percent": 숫자,
    "neutral_percent": 숫자,
    "negative_percent": 숫자
  }},
  "avg_purchase_intent": 소수점 1자리,
  "avg_recommendation": 소수점 1자리,
  "price_distribution": {{
    "무료": 숫자,
    "~3000원": 숫자,
    "~5000원": 숫자,
    "5000원+": 숫자
  }},
  "top_liked_points": ["1위", "2위", "3위"],
  "top_concerns": ["1위", "2위", "3위"],
  "segment_comparison": {{
    "by_age": {{"20대": "요약", "30대": "요약"}},
    "by_region": {{"수도권": "요약", "비수도권": "요약"}}
  }},
  "representative_quotes": {{
    "positive": "긍정 대표 응답",
    "negative": "부정 대표 응답",
    "neutral": "중립 대표 응답"
  }},
  "marketing_copy_suggestions": ["카피1", "카피2", "카피3"],
  "product_improvement_suggestions": ["개선1", "개선2", "개선3"],
  "follow_up_survey_questions": ["질문1", "질문2", "질문3", "질문4", "질문5"]
}}"""

    response = await client.chat.completions.create(
        model=settings.UPSTAGE_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=2000,
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    return json.loads(content)
