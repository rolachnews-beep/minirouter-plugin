/**
 * MiniRouter v2.1 — OpenClaw Plugin
 *
 * Intelligente Model-Auswahl via 15-dimensionaler Scoring Engine.
 * Hooked into OpenClaw via `before_model_resolve` lifecycle hook.
 *
 * Scoring analysiert den User-Prompt über 15 gewichtete Dimensionen
 * (inspiriert von ClawRouter) und entscheidet welches Modell am besten
 * passt: SIMPLE, MEDIUM, COMPLEX, REASONING, CREATIVE oder AGENTIC.
 */
/** OpenClaw Plugin API (Teilmengen-Sicht für TypeScript) */
interface OpenClawPluginApi {
    config: Record<string, unknown>;
    pluginConfig?: Record<string, unknown>;
    logger: {
        info: (msg: string) => void;
        warn: (msg: string) => void;
        debug?: (msg: string) => void;
        error: (msg: string) => void;
    };
    on: <K extends string>(hookName: K, handler: (event: unknown, ctx: unknown) => unknown, opts?: {
        priority?: number;
    }) => void;
}
export default function register(api: OpenClawPluginApi): void;
export { createRouter } from './router.js';
export type { RoutingDecision, ModelCategory, MiniRouterRequest } from './types.js';
//# sourceMappingURL=index.d.ts.map