import { SimulationRequest, SimulationResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function createSimulation(
  request: SimulationRequest
): Promise<{ simulation_id: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/v1/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "시뮬레이션 생성 실패");
  }
  return res.json();
}

export async function getSimulation(id: string): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/api/v1/simulate/${id}`);
  if (!res.ok) throw new Error("시뮬레이션 조회 실패");
  return res.json();
}

export function createSSEConnection(
  simId: string,
  onMessage: (data: unknown) => void,
  onError?: (err: Event) => void
): EventSource {
  const es = new EventSource(`${API_BASE}/api/v1/simulate/${simId}/stream`);
  es.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  es.onerror = (err) => {
    onError?.(err);
    es.close();
  };
  return es;
}
