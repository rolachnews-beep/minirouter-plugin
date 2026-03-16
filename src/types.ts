// MiniRouter Plugin Types v2

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
  /** Gewähltes Model (OpenRouter ID) */
  selectedModel: string;
  /** Tier/Kategorie: SIMPLE | MEDIUM | COMPLEX | REASONING | CREATIVE | AGENTIC | explicit */
  category: string;
  /** Confidence 0-1 (sigmoid calibrated) */
  confidence: number;
  /** Menschlich-lesbare Begründung */
  reasoning: string;
  /** Routing-Latenz in ms */
  latencyMs: number;
}

export interface ModelCategory {
  /** Tier-Name */
  name: string;
  /** Modelle: erstes = primary, rest = fallback */
  models: string[];
  /** Keywords zur Erkennung (multi-sprachig) */
  keywords: string[];
  /** Use Cases für diese Kategorie */
  useCases: string[];
}

export type RequestSource = 'main' | 'subagent' | 'compaction' | 'heartbeat' | 'cron';

export interface MiniRouterOptions {
  /** Fallback-Model wenn nichts erkannt wird */
  defaultModel?: string;
  /** Eigene Kategorien (überschreibt Defaults) */
  categories?: ModelCategory[];
  /** Routing Timeout in ms (default: 10) */
  timeoutMs?: number;
  /**
   * Welche Request-Types geroutet werden sollen.
   * Default: ['main', 'subagent']
   * Andere (compaction, heartbeat, cron) werden immer bypassed.
   */
  routeFor?: RequestSource[];
}

/** Dimension Score (intern, für Debug) */
export interface DimensionScore {
  name: string;
  score: number;
  signal: string | null;
}