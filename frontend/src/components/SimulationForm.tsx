"use client";

import { useState } from "react";
import { SimulationRequest, TargetCondition } from "@/lib/types";
import { createSimulation } from "@/lib/api";
import ResultView from "./ResultView";

const DEFAULT_QUESTIONS = [
  "이 서비스의 첫인상은 어떤가요?",
  "사용할 의향이 있나요? (1~5점)",
  "가장 마음에 드는 점은 무엇인가요?",
  "가장 걱정되는 점은 무엇인가요?",
  "얼마 정도라면 지불할 의향이 있나요?",
  "주변 사람에게 추천할 것 같나요? (1~5점)",
];

const PROVINCES = [
  "전체",
  "서울",
  "경기",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충청북",
  "충청남",
  "전라북",
  "전라남",
  "경상북",
  "경상남",
  "제주",
];

export default function SimulationForm() {
  const [productDescription, setProductDescription] = useState("");
  const [ageMin, setAgeMin] = useState(20);
  const [ageMax, setAgeMax] = useState(39);
  const [gender, setGender] = useState<string>("전체");
  const [province, setProvince] = useState<string>("전체");
  const [personaCount, setPersonaCount] = useState(10);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [customQuestion, setCustomQuestion] = useState("");

  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const targetCondition: TargetCondition = {
      age_min: ageMin,
      age_max: ageMax,
      gender: gender === "전체" ? null : gender === "남성" ? "남자" : "여자",
      province: province === "전체" ? null : province,
      occupation: null,
      education_level: null,
      persona_count: personaCount,
    };

    const request: SimulationRequest = {
      product_description: productDescription,
      target_condition: targetCondition,
      questions,
    };

    try {
      const result = await createSimulation(request);
      setSimulationId(result.simulation_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (customQuestion.trim()) {
      setQuestions([...questions, customQuestion.trim()]);
      setCustomQuestion("");
    }
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  if (simulationId) {
    return (
      <ResultView
        simulationId={simulationId}
        onReset={() => setSimulationId(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 제품 설명 */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          제품/서비스 설명
        </label>
        <textarea
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="예: AI 기반 대학생 과제 관리 앱. 강의계획서, 과제 마감일, 시험 일정, 팀플 일정을 자동으로 정리해주고, AI가 우선순위를 추천해주는 앱. 월 3,900원."
          className="w-full h-32 px-4 py-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxLength={2000}
          required
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {productDescription.length}/2000
        </p>
      </div>

      {/* 타겟 조건 */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          타겟 조건 설정
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              연령 (최소)
            </label>
            <input
              type="number"
              value={ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value))}
              min={19}
              max={99}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              연령 (최대)
            </label>
            <input
              type="number"
              value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
              min={19}
              max={99}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">성별</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option>전체</option>
              <option>남성</option>
              <option>여성</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">지역</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              {PROVINCES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs text-gray-500 mb-1">
            시뮬레이션 인원: <strong>{personaCount}명</strong>
          </label>
          <input
            type="range"
            value={personaCount}
            onChange={(e) => setPersonaCount(Number(e.target.value))}
            min={5}
            max={50}
            step={5}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>5명</span>
            <span>50명</span>
          </div>
        </div>
      </div>

      {/* 질문 설정 */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">질문 설정</h3>
        <ul className="space-y-2">
          {questions.map((q, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">
                {q}
              </span>
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-3">
          <input
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="추가 질문 입력..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addQuestion();
              }
            }}
          />
          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
          >
            추가
          </button>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 제출 */}
      <button
        type="submit"
        disabled={loading || !productDescription.trim()}
        className="w-full py-4 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "시뮬레이션 생성 중..." : `시뮬레이션 시작 (${personaCount}명)`}
      </button>
    </form>
  );
}
