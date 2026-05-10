import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.models.schemas import PersonaInfo, PersonaResponse

# Upstage Solar는 OpenAI 호환 API
_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.UPSTAGE_API_KEY,
            base_url=settings.UPSTAGE_BASE_URL,
        )
    return _client


def _build_system_prompt(persona: PersonaInfo) -> str:
    return f"""당신은 다음과 같은 실제 한국인 소비자입니다. 아래 정보에 완전히 몰입하여, 이 사람이 실제로 말하듯이 자연스럽게 답변하세요.

## 당신의 정보
- 나이: {persona.age}세
- 성별: {persona.sex}
- 거주지: {persona.province} {persona.district}
- 직업: {persona.occupation}
- 학력: {persona.education_level}
- 가구형태: {persona.family_type}
- 성격/라이프스타일: {persona.persona}
- 취미/관심사: {persona.hobbies_and_interests}
- 문화적 배경: {persona.cultural_background}

## 규칙
1. 반드시 위 인물의 관점에서만 답하세요.
2. 실제 한국인이 카톡이나 인터뷰에서 말하듯 자연스러운 구어체를 사용하세요.
3. 나이대와 지역에 맞는 말투를 반영하세요.
4. 솔직하게 답하세요. 긍정만 하지 말고, 불편하면 불편하다고 하세요.
5. 가격에 대해서는 본인의 경제 상황을 고려해 현실적으로 답하세요.
6. 출력은 반드시 지정된 JSON 형식으로만 작성하세요."""


def _build_user_prompt(product_description: str, questions: list[str]) -> str:
    questions_text = "\n".join(f"{i+1}. {q}" for i, q in enumerate(questions))
    return f"""## 제품/서비스 설명
{product_description}

## 질문
{questions_text}

## 출력 형식 (JSON)
{{
  "first_impression": "첫인상 (1-2문장, 구어체)",
  "purchase_intent_score": 1~5 중 정수,
  "liked_points": ["매력 포인트 1", "매력 포인트 2"],
  "concerns": ["우려사항 1", "우려사항 2"],
  "willingness_to_pay": "월 N원" 또는 "N원" 또는 "무료만 사용",
  "recommendation_likelihood": 1~5 중 정수,
  "representative_quote": "이 제품에 대한 한마디 (2-3문장, 자연스러운 구어체)",
  "overall_sentiment": "positive" 또는 "neutral" 또는 "negative"
}}"""


async def generate_persona_response(
    persona: PersonaInfo,
    product_description: str,
    questions: list[str],
) -> PersonaResponse:
    """Solar API를 호출해 페르소나 응답 생성"""
    client = _get_client()

    response = await client.chat.completions.create(
        model=settings.UPSTAGE_MODEL,
        messages=[
            {"role": "system", "content": _build_system_prompt(persona)},
            {"role": "user", "content": _build_user_prompt(product_description, questions)},
        ],
        max_tokens=500,
        temperature=0.8,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    data = json.loads(content)

    return PersonaResponse(
        persona_id=persona.persona_id,
        persona_info=persona,
        first_impression=data.get("first_impression", ""),
        purchase_intent_score=max(1, min(5, int(data.get("purchase_intent_score", 3)))),
        liked_points=data.get("liked_points", []),
        concerns=data.get("concerns", []),
        willingness_to_pay=data.get("willingness_to_pay", ""),
        recommendation_likelihood=max(1, min(5, int(data.get("recommendation_likelihood", 3)))),
        representative_quote=data.get("representative_quote", ""),
        overall_sentiment=data.get("overall_sentiment", "neutral"),
    )
