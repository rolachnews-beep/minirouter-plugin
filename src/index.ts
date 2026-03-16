import { createRouter } from './router.js';
import { MiniRouterRequest, MiniRouterResponse, RoutingDecision, MiniRouterOptions, RequestSource } from './types.js';
import { MODEL_CATEGORIES, getDefaultCategory } from './models.js';

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
 */
export class MiniRouter implements MiniRouterPlugin {
  private router: ReturnType<typeof createRouter>;
  private defaultModel: string;
  private routeFor: RequestSource[];

  constructor(options: MiniRouterOptions = {}) {
    this.defaultModel = options.defaultModel ?? getDefaultCategory().models[0];
    this.routeFor = options.routeFor ?? ['main', 'subagent'];
    this.router = createRouter({
      categories: options.categories,
      defaultModel: this.defaultModel,
    });
  }

  async complete(request: MiniRouterRequest): Promise<MiniRouterResponse> {
    throw new Error('API-Call not implemented. Use decide() for routing only.');
  }

  /**
   * Routing ohne Source-Check (legacy — routet immer)
   */
  async decide(request: MiniRouterRequest): Promise<RoutingDecision> {
    return this.router.route(request);
  }

  /**
   * Routing MIT Source-Check — der empfohlene Weg
   * 
   * - main / subagent → MiniRouter Scoring
   * - compaction / heartbeat / cron → sofort bypass (defaultModel)
   */
  async decideForSource(request: MiniRouterRequest, source: RequestSource): Promise<RoutingDecision> {
    if (NEVER_ROUTE.includes(source)) {
      return {
        selectedModel: this.defaultModel,
        category: 'bypass',
        confidence: 1.0,
        reasoning: `Bypass: ${source} requests use fixed model (no routing)`,
        latencyMs: 0,
      };
    }

    if (!this.routeFor.includes(source)) {
      return {
        selectedModel: this.defaultModel,
        category: 'bypass',
        confidence: 1.0,
        reasoning: `Bypass: source '${source}' not in routeFor [${this.routeFor.join(', ')}]`,
        latencyMs: 0,
      };
    }

    return this.router.route(request);
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
export { createRouter } from './router.js';
export { MODEL_CATEGORIES, getDefaultCategory } from './models.js';
export * from './types.js';