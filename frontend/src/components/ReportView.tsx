"use client";

import { InsightReport } from "@/lib/types";

interface Props {
  report: InsightReport;
}

export default function ReportView({ report }: Props) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <section className="bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Executive Summary
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          {report.executive_summary}
        </p>
      </section>

      {/* 감성 분석 */}
      <section className="bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">반응 분포</h3>
        <div className="space-y-2">
          <Bar
            label="긍정"
            value={report.sentiment_breakdown.positive_percent}
            color="bg-green-500"
          />
          <Bar
            label="중립"
            value={report.sentiment_breakdown.neutral_percent}
            color="bg-yellow-400"
          />
          <Bar
            label="부정"
            value={report.sentiment_breakdown.negative_percent}
            color="bg-red-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-gray-500">평균 구매 의향</p>
            <p className="text-xl font-bold text-blue-700">
              {report.avg_purchase_intent}/5
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">평균 추천 의향</p>
            <p className="text-xl font-bold text-purple-700">
              {report.avg_recommendation}/5
            </p>
          </div>
        </div>
      </section>

      {/* 가격 분포 */}
      {report.price_distribution && (
        <section className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            지불 의향가 분포
          </h3>
          <div className="space-y-2">
            {Object.entries(report.price_distribution).map(([range, pct]) => (
              <Bar key={range} label={range} value={pct} color="bg-blue-500" />
            ))}
          </div>
        </section>
      )}

      {/* 매력/우려 */}
      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-green-700 mb-3">
            Top 매력 포인트
          </h3>
          <ol className="space-y-2 text-sm text-gray-700">
            {report.top_liked_points.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-green-600 font-bold">{i + 1}.</span> {p}
              </li>
            ))}
          </ol>
        </section>
        <section className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-red-600 mb-3">
            Top 우려사항
          </h3>
          <ol className="space-y-2 text-sm text-gray-700">
            {report.top_concerns.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-red-500 font-bold">{i + 1}.</span> {c}
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* 세그먼트 비교 */}
      {report.segment_comparison && (
        <section className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            세그먼트별 비교
          </h3>
          {report.segment_comparison.by_age && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-1">연령별</p>
              <div className="space-y-1">
                {Object.entries(report.segment_comparison.by_age).map(
                  ([age, summary]) => (
                    <p key={age} className="text-sm text-gray-700">
                      <span className="font-medium">{age}:</span> {summary}
                    </p>
                  )
                )}
              </div>
            </div>
          )}
          {report.segment_comparison.by_region && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">지역별</p>
              <div className="space-y-1">
                {Object.entries(report.segment_comparison.by_region).map(
                  ([region, summary]) => (
                    <p key={region} className="text-sm text-gray-700">
                      <span className="font-medium">{region}:</span> {summary}
                    </p>
                  )
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 대표 응답 */}
      {report.representative_quotes && (
        <section className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">대표 응답</h3>
          <div className="space-y-3">
            <Quote
              type="긍정"
              color="text-green-700"
              text={report.representative_quotes.positive}
            />
            <Quote
              type="부정"
              color="text-red-600"
              text={report.representative_quotes.negative}
            />
            <Quote
              type="중립"
              color="text-gray-600"
              text={report.representative_quotes.neutral}
            />
          </div>
        </section>
      )}

      {/* 마케팅 카피 */}
      <section className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-sm font-bold text-blue-900 mb-3">
          추천 마케팅 카피
        </h3>
        <ol className="space-y-2">
          {report.marketing_copy_suggestions.map((copy, i) => (
            <li
              key={i}
              className="text-sm text-blue-800 bg-white px-4 py-3 rounded-lg border border-blue-100"
            >
              {i + 1}. &ldquo;{copy}&rdquo;
            </li>
          ))}
        </ol>
      </section>

      {/* 제품 개선 */}
      <section className="bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          제품 개선 제안
        </h3>
        <ul className="space-y-1 text-sm text-gray-700">
          {report.product_improvement_suggestions.map((s, i) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
      </section>

      {/* 후속 질문 */}
      <section className="bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          실제 설문에 넣을 후속 질문
        </h3>
        <ol className="space-y-1 text-sm text-gray-700 list-decimal list-inside">
          {report.follow_up_survey_questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Bar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-16">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 w-10 text-right">
        {value}%
      </span>
    </div>
  );
}

function Quote({
  type,
  color,
  text,
}: {
  type: string;
  color: string;
  text: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3">
      <span className={`text-xs font-medium ${color}`}>{type}</span>
      <p className="text-sm text-gray-700 mt-1">&ldquo;{text}&rdquo;</p>
    </div>
  );
}
