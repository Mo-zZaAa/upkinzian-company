"use client";

import { useState, useEffect, useCallback } from "react";
import { SimulationResult, PersonaResponse } from "@/lib/types";
import { getSimulation } from "@/lib/api";
import PersonaCard from "./PersonaCard";
import ReportView from "./ReportView";

interface Props {
  simulationId: string;
  onReset: () => void;
}

type Tab = "summary" | "responses" | "report";

export default function ResultView({ simulationId, onReset }: Props) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [tab, setTab] = useState<Tab>("summary");
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const data = await getSimulation(simulationId);
      setResult(data);
      return data.status === "completed" || data.status === "failed";
    } catch {
      setError("결과를 불러올 수 없습니다");
      return true;
    }
  }, [simulationId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const doPoll = async () => {
      const done = await poll();
      if (!done) {
        timer = setTimeout(doPoll, 2000);
      }
    };
    doPoll();
    return () => clearTimeout(timer);
  }, [poll]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={onReset} className="text-blue-600 underline">
          다시 시작
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">연결 중...</p>
      </div>
    );
  }

  const isRunning =
    result.status === "running" || result.status === "analyzing";
  const responses = result.responses || [];

  // 통계 계산
  const positiveCount = responses.filter(
    (r) => r.overall_sentiment === "positive"
  ).length;
  const negativeCount = responses.filter(
    (r) => r.overall_sentiment === "negative"
  ).length;
  const neutralCount = responses.length - positiveCount - negativeCount;
  const avgPurchase =
    responses.length > 0
      ? (
          responses.reduce((s, r) => s + r.purchase_intent_score, 0) /
          responses.length
        ).toFixed(1)
      : "0";
  const avgRecommend =
    responses.length > 0
      ? (
          responses.reduce((s, r) => s + r.recommendation_likelihood, 0) /
          responses.length
        ).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* 진행 바 */}
      {isRunning && (
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {result.status === "analyzing"
                ? "인사이트 리포트 생성 중..."
                : `페르소나 응답 수집 중...`}
            </span>
            <span className="text-sm text-gray-500">
              {result.progress}/{result.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${result.total > 0 ? (result.progress / result.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {(
          [
            ["summary", "요약"],
            ["responses", `응답 (${responses.length})`],
            ["report", "리포트"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === key
                ? "bg-white shadow text-blue-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 요약 탭 */}
      {tab === "summary" && (
        <div className="space-y-4">
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="긍정"
              value={
                responses.length > 0
                  ? `${Math.round((positiveCount / responses.length) * 100)}%`
                  : "-"
              }
              color="text-green-600"
            />
            <StatCard
              label="부정"
              value={
                responses.length > 0
                  ? `${Math.round((negativeCount / responses.length) * 100)}%`
                  : "-"
              }
              color="text-red-500"
            />
            <StatCard
              label="구매 의향"
              value={`${avgPurchase}/5`}
              color="text-blue-600"
            />
            <StatCard
              label="추천 의향"
              value={`${avgRecommend}/5`}
              color="text-purple-600"
            />
          </div>

          {/* 주요 매력/우려 */}
          {responses.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border p-5">
                <h4 className="text-sm font-semibold text-green-700 mb-3">
                  주요 매력 포인트
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {getTopItems(
                    responses.flatMap((r) => r.liked_points),
                    5
                  ).map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border p-5">
                <h4 className="text-sm font-semibold text-red-600 mb-3">
                  주요 우려사항
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {getTopItems(
                    responses.flatMap((r) => r.concerns),
                    5
                  ).map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 가격 분포 */}
          {responses.length > 0 && (
            <div className="bg-white rounded-xl border p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                지불 의향가
              </h4>
              <div className="space-y-1 text-sm">
                {responses.map((r, i) => (
                  <span
                    key={i}
                    className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded mr-2 mb-1"
                  >
                    {r.willingness_to_pay}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 응답 카드 탭 */}
      {tab === "responses" && (
        <div className="space-y-4">
          {responses.map((r) => (
            <PersonaCard key={r.persona_id} response={r} />
          ))}
          {responses.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              응답을 기다리는 중...
            </p>
          )}
        </div>
      )}

      {/* 리포트 탭 */}
      {tab === "report" && (
        <>
          {result.report ? (
            <ReportView report={result.report} />
          ) : (
            <p className="text-center text-gray-400 py-8">
              {isRunning
                ? "시뮬레이션 완료 후 리포트가 생성됩니다..."
                : "리포트를 생성하지 못했습니다."}
            </p>
          )}
        </>
      )}

      {/* 새 시뮬레이션 버튼 */}
      {!isRunning && (
        <button
          onClick={onReset}
          className="w-full py-3 border-2 border-blue-900 text-blue-900 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
        >
          새 시뮬레이션 시작
        </button>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-4 text-center shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function getTopItems(items: string[], count: number): string[] {
  const freq: Record<string, number> = {};
  items.forEach((item) => {
    const key = item.toLowerCase().trim();
    freq[key] = (freq[key] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => key);
}
