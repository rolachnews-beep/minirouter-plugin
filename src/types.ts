// MiniRouter Plugin Types

export interface MiniRouterRequest {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface MiniRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface RoutingDecision {
  selectedModel: string;
  category: string;
  confidence: number;
  reasoning: string;
  latencyMs: number;
}

export interface ModelCategory {
  name: string;
  models: string[];
  keywords: string[];
  useCases: string[];
}

export interface MiniRouterOptions {
  defaultModel?: string;
  categories?: ModelCategory[];
  timeoutMs?: number;
}