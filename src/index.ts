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
 * MiniRouter Plugin für OpenClaw
 * 
 * Verwendung:
 * ```typescript
 * import { createMiniRouter } from '@openclaw/minirouter';
 * 
 * const router = createMiniRouter({
 *   defaultModel: 'openrouter/minimax/minimax-m2.5'
 * });
 * 
 * // Automatisch richtig routen
 * const decision = await router.decide({
 *   prompt: 'Erkläre mir die Quantenphysik'
 * });
 * 
 * console.log(decision.selectedModel); // z.B. claude-3.5-sonnet
 * ```
 */
export class MiniRouter implements MiniRouterPlugin {
  private defaultModel?: string;
  
  constructor(options: MiniRouterOptions = {}) {
    this.defaultModel = options.defaultModel;
  }
  
  /**
   * Haupteinstieg: Request senden und automatisch richtig routen
   * 
   * Hinweis: Diese Methode ruft OpenRouter API auf und braucht API-Key
   * Für reine Routing-Entscheidung: use decide() instead
   */
  async complete(request: MiniRouterRequest): Promise<MiniRouterResponse> {
    // 1. Routing-Entscheidung treffen
    const decision = await this.decide(request);
    
    // 2. TODO: API-Call zu OpenRouter (braucht apiKey in config)
    // Für jetzt nur Decision zurückgeben
    throw new Error('API-Call not implemented. Use decide() for routing only.');
  }
  
  /**
   * Nur Routing-Entscheidung holen (ohne API-Call)
   * 
   * Dies ist die Hauptmethode für das Plugin:
   * - Analysiert den Prompt
   * - Entscheidet welches Model verwendet werden soll
   * - Gibt Decision zurück mit selectedModel, confidence, reasoning
   */
  async decide(request: MiniRouterRequest): Promise<RoutingDecision> {
    // Override mit defaultModel falls angegeben
    if (this.defaultModel && !request.model) {
      request.model = this.defaultModel;
    }
    
    return router.route(request);
  }
  
  /**
   * Health Check - prüft ob Router funktioniert
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Einfacher Test-Routing-Call
      await this.decide({ prompt: 'hello' });
      return true;
    } catch {
      return false;
    }
  }
}

// Export Factory-Funktion für einfache Nutzung
export function createMiniRouter(options?: MiniRouterOptions): MiniRouter {
  return new MiniRouter(options);
}

// Export Hauptklassen
export { router } from './router.js';
export * from './types.js';