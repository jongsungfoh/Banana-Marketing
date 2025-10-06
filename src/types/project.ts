// 产品分析結果
export interface ProductAnalysis {
  summary: string;
  creative_prompts: {
    concept: string;
    prompt: string;
    rationale: string;
    background: string;
    include_model: boolean;
  }[];
  reasoning_steps: {
    step: string;
    analysis: string;
  }[];
}
