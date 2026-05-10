export interface TargetCondition {
  age_min: number;
  age_max: number;
  gender: string | null;
  province: string | null;
  occupation: string | null;
  education_level: string | null;
  persona_count: number;
}

export interface SimulationRequest {
  product_description: string;
  target_condition: TargetCondition;
  questions: string[];
}

export interface PersonaInfo {
  persona_id: string;
  age: number;
  sex: string;
  province: string;
  district: string;
  occupation: string;
  education_level: string;
  persona: string;
  hobbies_and_interests: string;
  cultural_background: string;
  family_type: string;
}

export interface PersonaResponse {
  persona_id: string;
  persona_info: PersonaInfo;
  first_impression: string;
  purchase_intent_score: number;
  liked_points: string[];
  concerns: string[];
  willingness_to_pay: string;
  recommendation_likelihood: number;
  representative_quote: string;
  overall_sentiment: "positive" | "neutral" | "negative";
}

export interface SimulationResult {
  simulation_id: string;
  status: "queued" | "running" | "analyzing" | "completed" | "failed";
  progress: number;
  total: number;
  responses: PersonaResponse[];
  report: InsightReport | null;
}

export interface InsightReport {
  executive_summary: string;
  sentiment_breakdown: {
    positive_percent: number;
    neutral_percent: number;
    negative_percent: number;
  };
  avg_purchase_intent: number;
  avg_recommendation: number;
  price_distribution: Record<string, number>;
  top_liked_points: string[];
  top_concerns: string[];
  segment_comparison: {
    by_age: Record<string, string>;
    by_region: Record<string, string>;
  };
  representative_quotes: {
    positive: string;
    negative: string;
    neutral: string;
  };
  marketing_copy_suggestions: string[];
  product_improvement_suggestions: string[];
  follow_up_survey_questions: string[];
}
