/** Eingabe für den Router */
export interface MiniRouterRequest {
    prompt: string;
    model?: string;
    max_tokens?: number;
    temperature?: number;
    stream?: boolean;
}
/** Ergebnis einer Routing-Entscheidung */
export interface RoutingDecision {
    /** Gewähltes Model (OpenRouter ID) */
    selectedModel: string;
    /** Tier/Kategorie: SIMPLE | MEDIUM | COMPLEX | REASONING | CREATIVE | AGENTIC | DEFAULT */
    category: string;
    /** Confidence 0-1 (sigmoid calibrated) */
    confidence: number;
    /** Menschlich-lesbare Begründung */
    reasoning: string;
    /** Routing-Latenz in ms */
    latencyMs: number;
}
/** Model-Kategorie / Tier */
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
/** Dimension Score (intern, für Debug) */
export interface DimensionScore {
    name: string;
    score: number;
    signal: string | null;
}
//# sourceMappingURL=types.d.ts.map