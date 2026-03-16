import { MODEL_CATEGORIES, getDefaultCategory } from './models.js';
import { MiniRouterRequest, RoutingDecision, ModelCategory, DimensionScore } from './types.js';

// ═══════════════════════════════════════════════════════════════
// MiniRouter v2 — Weighted Scoring Router
// 
// Inspiriert von ClawRouter's 15-dimensionaler Scoring-Engine:
// - 15 Dimensionen mit individuellen Weights
// - Sigmoid Confidence Calibration
// - Tier-System (SIMPLE → REASONING) + CREATIVE + AGENTIC
// - Override-Regeln für Sonderfälle
// - <1ms Latenz (100% local, keine externen API-Calls)
// ═══════════════════════════════════════════════════════════════

// Dimension Weights (sum ≈ 1.0)
const DIMENSION_WEIGHTS: Record<string, number> = {
  tokenCount: 0.08,
  codePresence: 0.15,
  reasoningMarkers: 0.18,
  technicalTerms: 0.10,
  creativeMarkers: 0.05,
  simpleIndicators: 0.02,
  multiStepPatterns: 0.10,
  questionComplexity: 0.05,
  imperativeVerbs: 0.03,
  constraintCount: 0.04,
  outputFormat: 0.03,
  referenceComplexity: 0.02,
  negationComplexity: 0.01,
  domainSpecificity: 0.02,
  agenticTask: 0.04,
};

// Tier Boundaries auf weighted score axis
const TIER_BOUNDARIES = {
  simpleMedium: 0.0,
  mediumComplex: 0.30,
  complexReasoning: 0.50,
};

// Confidence settings
const CONFIDENCE_STEEPNESS = 12;

/**
 * MiniRouter — Intelligenter Model-Router für OpenClaw
 */
export class Router {
  private categories: ModelCategory[] = MODEL_CATEGORIES;

  /**
   * Hauptmethode: Entscheidet welches Model verwendet werden soll.
   * 
   * WICHTIG: `request.model` wird IGNORIERT für Scoring-Zwecke.
   * Nur `defaultModel` wird als Fallback nach dem Scoring verwendet.
   */
  async route(request: MiniRouterRequest, defaultModel?: string): Promise<RoutingDecision> {
    const startTime = Date.now();

    // ── Overrides prüfen (vor Scoring) ──
    const override = this.checkOverrides(request);
    if (override) {
      return {
        selectedModel: override.models[0],
        category: override.name,
        confidence: 0.95,
        reasoning: `Override: ${override.reason}`,
        latencyMs: Date.now() - startTime
      };
    }

    // ── Weighted Scoring ──
    const prompt = request.prompt;
    const estimatedTokens = Math.ceil(prompt.length / 4); // ~4 chars per token
    const userText = prompt.toLowerCase();

    // Alle 15 Dimensionen scoren
    const dimensions: DimensionScore[] = [
      this.scoreTokenCount(estimatedTokens),
      this.scoreKeywordDimension(userText, 'codePresence', 'code',
        this.getCategoryKeywords('MEDIUM'), { low: 1, high: 2 },
        { none: 0, low: 0.5, high: 1.0 }),
      this.scoreKeywordDimension(userText, 'reasoningMarkers', 'reasoning',
        this.getCategoryKeywords('REASONING'), { low: 1, high: 2 },
        { none: 0, low: 0.7, high: 1.0 }),
      this.scoreKeywordDimension(userText, 'technicalTerms', 'technical',
        this.getCategoryKeywords('COMPLEX'), { low: 2, high: 4 },
        { none: 0, low: 0.5, high: 1.0 }),
      this.scoreKeywordDimension(userText, 'creativeMarkers', 'creative',
        this.getCategoryKeywords('CREATIVE'), { low: 1, high: 2 },
        { none: 0, low: 0.5, high: 0.7 }),
      this.scoreKeywordDimension(userText, 'simpleIndicators', 'simple',
        this.getCategoryKeywords('SIMPLE'), { low: 1, high: 2 },
        { none: 0, low: -1.0, high: -1.0 }),
      this.scoreMultiStep(userText),
      this.scoreQuestionComplexity(prompt),
      this.scoreImperativeVerbs(userText),
      this.scoreConstraints(userText),
      this.scoreOutputFormat(userText),
      this.scoreReferences(userText),
      this.scoreNegation(userText),
      this.scoreDomainSpecific(userText),
      this.scoreAgenticTask(userText),
    ];

    // Weighted Score berechnen
    let weightedScore = 0;
    for (const d of dimensions) {
      const w = DIMENSION_WEIGHTS[d.name] ?? 0;
      weightedScore += d.score * w;
    }

    // Signals sammeln
    const signals = dimensions.filter(d => d.signal !== null).map(d => d.signal!);

    // ── Special Tier Overrides (vor selectTier) ──

    // Reasoning Override: 2+ Reasoning-Keywords → REASONING
    const reasoningKeywords = this.getCategoryKeywords('REASONING');
    const reasoningMatches = reasoningKeywords.filter(kw => userText.includes(kw));
    if (reasoningMatches.length >= 2) {
      const cat = this.categories.find(c => c.name === 'REASONING')!;
      return {
        selectedModel: cat.models[0],
        category: 'REASONING',
        confidence: Math.max(this.sigmoid(weightedScore), 0.85),
        reasoning: `Reasoning-Override: ${reasoningMatches.slice(0, 3).join(', ')}`,
        latencyMs: Date.now() - startTime
      };
    }

    // Creative Override: 2+ Creative-Keywords → CREATIVE
    const creativeKeywords = this.getCategoryKeywords('CREATIVE');
    const creativeMatches = creativeKeywords.filter(kw => userText.includes(kw));
    if (creativeMatches.length >= 2) {
      const cat = this.categories.find(c => c.name === 'CREATIVE')!;
      return {
        selectedModel: cat.models[0],
        category: 'CREATIVE',
        confidence: Math.max(this.sigmoid(weightedScore), 0.75),
        reasoning: `Creative-Override: ${creativeMatches.slice(0, 3).join(', ')}`,
        latencyMs: Date.now() - startTime
      };
    }

    // Agentic Override: 3+ Agentic-Keywords → AGENTIC
    const agenticKeywords = this.getCategoryKeywords('AGENTIC');
    const agenticMatches = agenticKeywords.filter(kw => userText.includes(kw));
    if (agenticMatches.length >= 3) {
      const cat = this.categories.find(c => c.name === 'AGENTIC')!;
      return {
        selectedModel: cat.models[0],
        category: 'AGENTIC',
        confidence: Math.max(this.sigmoid(weightedScore), 0.80),
        reasoning: `Agentic-Override: ${agenticMatches.slice(0, 3).join(', ')}`,
        latencyMs: Date.now() - startTime
      };
    }

    // ── Standard Tier Selection ──
    const tier = this.selectTier(weightedScore);
    const category = this.categories.find(c => c.name === tier) ?? getDefaultCategory();

    return {
      selectedModel: category.models[0],
      category: category.name,
      confidence: this.sigmoid(weightedScore),
      reasoning: `Score: ${weightedScore.toFixed(3)} | Tier: ${tier} | Signals: ${signals.slice(0, 3).join(', ') || 'none'}`,
      latencyMs: Date.now() - startTime
    };
  }

  // ═══════════════════════════════════════════════════
  // Override-Regeln (Sonderfälle)
  // ═══════════════════════════════════════════════════

  private checkOverrides(request: MiniRouterRequest): { models: string[]; name: string; reason: string } | null {
    const estimatedTokens = Math.ceil(request.prompt.length / 4);

    // Large Context → COMPLEX
    if (estimatedTokens > 25000) {
      const cat = this.categories.find(c => c.name === 'COMPLEX');
      if (cat) return { models: cat.models, name: cat.name, reason: `Large context (${estimatedTokens} tokens)` };
    }

    // Structured Output → mindestens MEDIUM
    const lowerPrompt = request.prompt.toLowerCase();
    if (/\b(json|yaml|xml|csv|structured|schema)\b/.test(lowerPrompt)) {
      const cat = this.categories.find(c => c.name === 'MEDIUM') ?? getDefaultCategory();
      return { models: cat.models, name: cat.name, reason: 'Structured output requested' };
    }

    // High max_tokens → REASONING
    if (request.max_tokens && request.max_tokens > 4000) {
      const cat = this.categories.find(c => c.name === 'REASONING') ?? getDefaultCategory();
      return { models: cat.models, name: cat.name, reason: `High max_tokens (${request.max_tokens})` };
    }

    return null;
  }

  // ═══════════════════════════════════════════════════
  // Dimension Scorers (15 Stück)
  // ═══════════════════════════════════════════════════

  /** Dimension 1: Token Count */
  private scoreTokenCount(estimatedTokens: number): DimensionScore {
    if (estimatedTokens < 50) return { name: 'tokenCount', score: -1.0, signal: `short (${estimatedTokens}t)` };
    if (estimatedTokens > 500) return { name: 'tokenCount', score: 1.0, signal: `long (${estimatedTokens}t)` };
    return { name: 'tokenCount', score: 0, signal: null };
  }

  /** Dimension 2-6: Keyword-Matching gegen Kategorie-Keywords */
  private scoreKeywordDimension(
    text: string,
    name: string,
    signalLabel: string,
    keywords: string[],
    thresholds: { low: number; high: number },
    scores: { none: number; low: number; high: number },
  ): DimensionScore {
    const matches = keywords.filter(kw => text.includes(kw));
    if (matches.length >= thresholds.high) {
      return { name, score: scores.high, signal: `${signalLabel} (${matches.slice(0, 3).join(', ')})` };
    }
    if (matches.length >= thresholds.low) {
      return { name, score: scores.low, signal: `${signalLabel} (${matches.slice(0, 3).join(', ')})` };
    }
    return { name, score: scores.none, signal: null };
  }

  /** Dimension 7: Multi-Step Patterns */
  private scoreMultiStep(text: string): DimensionScore {
    const patterns = [/first.*then/, /step \d/, /\d\.\s/, /danach.*dann/, /after that/];
    const hits = patterns.filter(p => p.test(text));
    if (hits.length > 0) return { name: 'multiStepPatterns', score: 0.5, signal: 'multi-step' };
    return { name: 'multiStepPatterns', score: 0, signal: null };
  }

  /** Dimension 8: Question Complexity (multiple ?) */
  private scoreQuestionComplexity(prompt: string): DimensionScore {
    const count = (prompt.match(/\?/g) || []).length;
    if (count > 3) return { name: 'questionComplexity', score: 0.5, signal: `${count} questions` };
    return { name: 'questionComplexity', score: 0, signal: null };
  }

  /** Dimension 9: Imperative Verbs */
  private scoreImperativeVerbs(text: string): DimensionScore {
    const verbs = [
      'build', 'create', 'implement', 'design', 'develop', 'generate',
      'deploy', 'configure', 'set up', 'construct',
      'erstellen', 'bauen', 'implementieren', 'entwerfen', 'entwickeln',
      'generieren', 'konfigurieren', 'einrichten',
      '构建', '创建', '实现', '设计', '开发', '生成',
      '構築', '作成', '実装', '設計', '開発',
      'построить', 'создать', 'реализовать', 'разработать',
    ];
    const matches = verbs.filter(v => text.includes(v));
    if (matches.length >= 2) return { name: 'imperativeVerbs', score: 0.5, signal: `imperative (${matches.slice(0, 2).join(', ')})` };
    if (matches.length >= 1) return { name: 'imperativeVerbs', score: 0.3, signal: `imperative (${matches[0]})` };
    return { name: 'imperativeVerbs', score: 0, signal: null };
  }

  /** Dimension 10: Constraint Indicators */
  private scoreConstraints(text: string): DimensionScore {
    const constraints = [
      'under', 'at most', 'at least', 'no more than',
      'maximum', 'minimum', 'limit', 'budget', 'o(n',
      'höchstens', 'mindestens', 'nicht mehr als', 'maximal',
      '不超过', '至少', '最多', '限制',
      '最大', '最小',
    ];
    const matches = constraints.filter(c => text.includes(c));
    if (matches.length >= 3) return { name: 'constraintCount', score: 0.7, signal: `constraints (${matches.slice(0, 3).join(', ')})` };
    if (matches.length >= 1) return { name: 'constraintCount', score: 0.3, signal: `constraints (${matches[0]})` };
    return { name: 'constraintCount', score: 0, signal: null };
  }

  /** Dimension 11: Output Format */
  private scoreOutputFormat(text: string): DimensionScore {
    const formats = ['json', 'yaml', 'xml', 'table', 'csv', 'markdown', 'schema', 'format as', 'structured'];
    const matches = formats.filter(f => text.includes(f));
    if (matches.length >= 2) return { name: 'outputFormat', score: 0.7, signal: `format (${matches.slice(0, 2).join(', ')})` };
    if (matches.length >= 1) return { name: 'outputFormat', score: 0.4, signal: `format (${matches[0]})` };
    return { name: 'outputFormat', score: 0, signal: null };
  }

  /** Dimension 12: Reference Complexity */
  private scoreReferences(text: string): DimensionScore {
    const refs = ['previous', 'following', 'the docs', 'the api', 'the code', 'earlier', 'attached',
      'vorherige', 'folgende', 'dokumentation', 'anhang',
    ];
    const matches = refs.filter(r => text.includes(r));
    if (matches.length >= 2) return { name: 'referenceComplexity', score: 0.5, signal: `references (${matches.slice(0, 2).join(', ')})` };
    if (matches.length >= 1) return { name: 'referenceComplexity', score: 0.3, signal: `references (${matches[0]})` };
    return { name: 'referenceComplexity', score: 0, signal: null };
  }

  /** Dimension 13: Negation Complexity */
  private scoreNegation(text: string): DimensionScore {
    const negations = [
      "don't", 'do not', 'avoid', 'never', 'without', 'except', 'exclude', 'no longer',
      'nicht', 'vermeide', 'niemals', 'ohne', 'außer', 'ausschließen',
      '不要', '避免', '从不', '没有',
      'しないで', '避ける', '決して', 'なしで',
    ];
    const matches = negations.filter(n => text.includes(n));
    if (matches.length >= 3) return { name: 'negationComplexity', score: 0.5, signal: `negation (${matches.slice(0, 2).join(', ')})` };
    if (matches.length >= 2) return { name: 'negationComplexity', score: 0.3, signal: `negation (${matches.slice(0, 2).join(', ')})` };
    return { name: 'negationComplexity', score: 0, signal: null };
  }

  /** Dimension 14: Domain-Specific Keywords */
  private scoreDomainSpecific(text: string): DimensionScore {
    const domains = [
      'quantum', 'fpga', 'vlsi', 'risc-v', 'asic', 'photonics',
      'genomics', 'proteomics', 'topological', 'homomorphic',
      'zero-knowledge', 'lattice-based', 'blockchain',
      'quanten', 'photonik', 'genomik', 'proteomik', 'topologisch',
      'homomorph', 'gitterbasiert',
      '量子', '光子学', '基因组学', '蛋白质组学', '拓扑', '同态', '区块链',
    ];
    const matches = domains.filter(d => text.includes(d));
    if (matches.length >= 2) return { name: 'domainSpecificity', score: 0.8, signal: `domain (${matches.slice(0, 2).join(', ')})` };
    if (matches.length >= 1) return { name: 'domainSpecificity', score: 0.5, signal: `domain (${matches[0]})` };
    return { name: 'domainSpecificity', score: 0, signal: null };
  }

  /** Dimension 15: Agentic Task */
  private scoreAgenticTask(text: string): DimensionScore {
    const agenticKeywords = this.getCategoryKeywords('AGENTIC');
    const matches = agenticKeywords.filter(kw => text.includes(kw));
    if (matches.length >= 4) return { name: 'agenticTask', score: 1.0, signal: `agentic (${matches.slice(0, 3).join(', ')})` };
    if (matches.length >= 2) return { name: 'agenticTask', score: 0.6, signal: `agentic (${matches.slice(0, 2).join(', ')})` };
    if (matches.length >= 1) return { name: 'agenticTask', score: 0.2, signal: `agentic-light (${matches[0]})` };
    return { name: 'agenticTask', score: 0, signal: null };
  }

  // ═══════════════════════════════════════════════════
  // Helper-Methoden
  // ═══════════════════════════════════════════════════

  /** Holt Keywords einer Kategorie */
  private getCategoryKeywords(tierName: string): string[] {
    const cat = this.categories.find(c => c.name === tierName);
    return cat?.keywords ?? [];
  }

  /** Map weighted score zu Tier (4-stufig: SIMPLE → MEDIUM → COMPLEX → REASONING) */
  private selectTier(weightedScore: number): string {
    if (weightedScore < TIER_BOUNDARIES.simpleMedium) return 'SIMPLE';
    if (weightedScore < TIER_BOUNDARIES.mediumComplex) return 'MEDIUM';
    if (weightedScore < TIER_BOUNDARIES.complexReasoning) return 'COMPLEX';
    return 'REASONING';
  }

  /** Sigmoid Confidence Calibration */
  private sigmoid(score: number): number {
    return 1 / (1 + Math.exp(-CONFIDENCE_STEEPNESS * score));
  }
}

export const router = new Router();