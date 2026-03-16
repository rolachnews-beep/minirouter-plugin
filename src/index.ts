import { router } from './router.js';
import { MiniRouterRequest, MiniRouterResponse, RoutingDecision, MiniRouterOptions, RequestSource } from './types.js';

/** Request-Typen die NICHT geroutet werden (immer bypass) */
const NEVER_ROUTE: RequestSource[] = ['compaction', 'heartbeat', 'cron'];

export interface MiniRouterPlugin {
  complete(request: MiniRouterRequest): Promise<MiniRouterResponse>;
  decide(request: MiniRouterRequest): Promise<RoutingDecision>;
  decideForSource(request: MiniRouterRequest, source: RequestSource): Promise<RoutingDecision>;
  healthCheck(): Promise<boolean>;
}

/**
 * MiniRouter v2 — Intelligente Model-Auswahl für OpenClaw
 * 
 * Routing-Scope:
 * - main (User → Agent Haupt-Chat) ✅
 * - subagent (Sub-Agent Tasks) ✅
 * - compaction / heartbeat / cron ❌ (immer bypass, Config-basiert)
 * 
 * Verwendung:
 * ```typescript
 * import { createMiniRouter } from '@openclaw/minirouter';
 * 
 * const mr = createMiniRouter({
 *   defaultModel: 'openrouter/minimax/minimax-m2.5',
 *   routeFor: ['main', 'subagent']
 * });
 * 
 * // Mit Source-Angabe — compaction/heartbeat/cron → sofort bypass
 * const decision = await mr.decideForSource(request, 'subagent');
 * ```
 */
export class MiniRouter implements MiniRouterPlugin {
  private defaultModel?: string;
  private routeFor: RequestSource[];

  constructor(options: MiniRouterOptions = {}) {
    this.defaultModel = options.defaultModel;
    this.routeFor = options.routeFor ?? ['main', 'subagent'];
  }

  async complete(request: MiniRouterRequest): Promise<MiniRouterResponse> {
    throw new Error('API-Call not implemented. Use decide() for routing only.');
  }

  /**
   * Routing ohne Source-Check (legacy — routet immer)
   */
  async decide(request: MiniRouterRequest): Promise<RoutingDecision> {
    if (this.defaultModel && !request.model) {
      request = { ...request, model: this.defaultModel };
    }
    return router.route(request);
  }

  /**
   * Routing MIT Source-Check — der empfohlene Weg
   * 
   * - main / subagent → MiniRouter Scoring
   * - compaction / heartbeat / cron → sofort bypass (defaultModel oder original)
   */
  async decideForSource(request: MiniRouterRequest, source: RequestSource): Promise<RoutingDecision> {
    // Bypass für System-Request-Typen
    if (NEVER_ROUTE.includes(source)) {
      const bypassModel = this.defaultModel ?? request.model ?? 'openrouter/minimax/minimax-m2.5';
      return {
        selectedModel: bypassModel,
        category: 'bypass',
        confidence: 1.0,
        reasoning: `Bypass: ${source} requests use fixed model (no routing)`,
        latencyMs: 0,
      };
    }

    // Nur routen wenn source in routeFor-Liste
    if (!this.routeFor.includes(source)) {
      const bypassModel = this.defaultModel ?? request.model ?? 'openrouter/minimax/minimax-m2.5';
      return {
        selectedModel: bypassModel,
        category: 'bypass',
        confidence: 1.0,
        reasoning: `Bypass: source '${source}' not in routeFor [${this.routeFor.join(', ')}]`,
        latencyMs: 0,
      };
    }

    // Normaler Routing-Flow
    if (this.defaultModel && !request.model) {
      request = { ...request, model: this.defaultModel };
    }
    return router.route(request);
  }

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