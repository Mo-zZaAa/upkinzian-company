"use client";

import { PersonaResponse } from "@/lib/types";

interface Props {
  response: PersonaResponse;
}

export default function PersonaCard({ response: r }: Props) {
  const sentimentColor = {
    positive: "bg-green-50 border-green-200",
    negative: "bg-red-50 border-red-200",
    neutral: "bg-gray-50 border-gray-200",
  }[r.overall_sentiment];

  const sentimentLabel = {
    positive: "긍정",
    negative: "부정",
    neutral: "중립",
  }[r.overall_sentiment];

  const sentimentBadge = {
    positive: "bg-green-100 text-green-700",
    negative: "bg-red-100 text-red-700",
    neutral: "bg-gray-100 text-gray-600",
  }[r.overall_sentiment];

  return (
    <div className={`rounded-xl border p-5 ${sentimentColor}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
            {r.persona_info.sex === "남자" ? "M" : "F"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {r.persona_info.age}세 {r.persona_info.sex} | {r.persona_info.province}{" "}
              {r.persona_info.district}
            </p>
            <p className="text-xs text-gray-500">{r.persona_info.occupation}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${sentimentBadge}`}>
          {sentimentLabel}
        </span>
      </div>

      {/* 첫인상 */}
      <p className="text-sm text-gray-700 mb-3 italic">
        &ldquo;{r.first_impression}&rdquo;
      </p>

      {/* 점수 */}
      <div className="flex gap-4 mb-3">
        <div className="text-center">
          <p className="text-xs text-gray-500">구매의향</p>
          <p className="text-lg font-bold text-blue-700">
            {r.purchase_intent_score}/5
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">추천</p>
          <p className="text-lg font-bold text-purple-700">
            {r.recommendation_likelihood}/5
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">지불의향</p>
          <p className="text-sm font-semibold text-gray-700">
            {r.willingness_to_pay}
          </p>
        </div>
      </div>

      {/* 매력/우려 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs font-medium text-green-700 mb-1">매력 포인트</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {r.liked_points.map((p, i) => (
              <li key={i}>• {p}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-red-600 mb-1">우려사항</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {r.concerns.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 대표 발언 */}
      <div className="bg-white/60 rounded-lg px-3 py-2">
        <p className="text-sm text-gray-700">
          &ldquo;{r.representative_quote}&rdquo;
        </p>
      </div>
    </div>
  );
}
