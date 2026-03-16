import { router } from './router.js';
import { MiniRouterRequest, MiniRouterResponse, RoutingDecision, MiniRouterOptions } from './types.js';

export interface MiniRouterPlugin {
  /**
   * Haupteinstieg: Request senden und automatisch richtig routen
   */
  complete(request: MiniRouterRequest): Promise<MiniRouterResponse>;

  /**
   * Nur Routing-Entscheidung holen (ohne API-Call)
   */
  decide(request: MiniRouterRequest): Promise<RoutingDecision>;

  /**
   * Health Check
   */
  healthCheck(): Promise<boolean>;
}

/**
 * MiniRouter v2 — Intelligente Model-Auswahl für OpenClaw
 * 
 * 15-dimensionale gewichtete Scoring, inspiriert von ClawRouter:
 * - Token Count, Code Presence, Reasoning Markers, Technical Terms
 * - Creative Markers, Simple Indicators, Multi-Step Patterns
 * - Question Complexity, Imperative Verbs, Constraints
 * - Output Format, References, Negation, Domain Specificity, Agentic
 * 
 * Sigmoid Confidence Calibration, Tier-System, <1ms Latenz.
 * 
 * Verwendung:
 * ```typescript
 * import { createMiniRouter } from '@openclaw/minirouter';
 * 
 * const mr = createMiniRouter({
 *   defaultModel: 'openrouter/meta-llama/llama-3.1-8b-instruct'
 * });
 * 
 * const decision = await mr.decide({
 *   prompt: 'Beweise den Satz von Pythagoras schritt für schritt'
 * });
 * // → category: 'REASONING', model: 'openrouter/openai/o4-mini'
 * ```
 */
export class MiniRouter implements MiniRouterPlugin {
  private defaultModel?: string;

  constructor(options: MiniRouterOptions = {}) {
    this.defaultModel = options.defaultModel;
  }

  /**
   * Request + API-Call (noch nicht implementiert — nutze decide() für Routing)
   */
  async complete(request: MiniRouterRequest): Promise<MiniRouterResponse> {
    throw new Error('API-Call not implemented. Use decide() for routing only.');
  }

  /**
   * Nur Routing-Entscheidung holen (ohne API-Call)
   * 
   * Dies ist die Hauptmethode:
   * - Analysiert den Prompt über 15 Dimensionen
   * - Berechnet weighted score + sigmoid confidence
   * - Gibt Tier + Model + Begründung zurück
   */
  async decide(request: MiniRouterRequest): Promise<RoutingDecision> {
    if (this.defaultModel && !request.model) {
      request = { ...request, model: this.defaultModel };
    }
    return router.route(request);
  }

  /**
   * Health Check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.decide({ prompt: 'hello' });
      return true;
    } catch {
      return false;
    }
  }
}

// Export Factory
export function createMiniRouter(options?: MiniRouterOptions): MiniRouter {
  return new MiniRouter(options);
}

// Re-exports
export { router } from './router.js';
export { MODEL_CATEGORIES, getDefaultCategory } from './models.js';
export type { DimensionScore } from './types.js';
export * from './types.js';