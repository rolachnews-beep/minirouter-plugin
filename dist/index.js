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
import { createRouter } from './router.js';
// ── Defaults ───────────────────────────────────────────────────────
const DEFAULT_MODEL = 'minimax/minimax-m2.5';
const DEFAULT_CONFIDENCE = 0.70;
const DEFAULT_BYPASS_TRIGGERS = ['heartbeat', 'cron', 'memory'];
// ── Plugin Entry ──────────────────────────────────────────────────
export default function register(api) {
    // Config lesen
    const cfg = (api.pluginConfig ?? {});
    const defaultModel = cfg.defaultModel ?? DEFAULT_MODEL;
    const confidenceThreshold = cfg.confidenceThreshold ?? DEFAULT_CONFIDENCE;
    const logDecisions = cfg.logDecisions ?? false;
    const bypassTriggers = new Set(cfg.bypassTriggers ?? DEFAULT_BYPASS_TRIGGERS);
    // Router initialisieren (mit Default-Modell als Fallback)
    const router = createRouter({ defaultModel });
    api.logger.info(`MiniRouter v2.1 active — defaultModel: ${defaultModel}, confidenceThreshold: ${confidenceThreshold}, bypassTriggers: [${[...bypassTriggers].join(', ')}]`);
    // ── Hook: before_model_resolve ──────────────────────────────────
    //
    // Läuft VOR session load. Hat Zugriff auf:
    //   event.prompt  → der User-Prompt
    //   ctx.trigger   → "user" | "heartbeat" | "cron" | "memory"
    //
    // Kann zurückgeben:
    //   modelOverride    → z.B. "openai/o4-mini" (ohne provider prefix!)
    //   providerOverride → z.B. "ollama"
    //
    // Wenn nichts (oder undefined) zurückgegeben wird, bleibt das
    // konfigurierte Standard-Modell aktiv.
    api.on('before_model_resolve', async (event, ctx) => {
        // ── Bypass: heartbeat, cron, memory → kein Routing ──
        const trigger = ctx?.trigger;
        if (trigger && bypassTriggers.has(trigger)) {
            if (logDecisions) {
                api.logger.info(`MiniRouter: BYPASS trigger=${trigger} → default model`);
            }
            return undefined;
        }
        // ── Prompt extrahieren ──
        const prompt = event?.prompt ?? '';
        if (!prompt.trim()) {
            return undefined;
        }
        // ── Scoring ──
        const decision = await router.route({ prompt });
        if (logDecisions) {
            const meta = [
                `trigger=${trigger ?? 'user'}`,
                `agent=${ctx?.agentId ?? '?'}`,
                `channel=${ctx?.channelId ?? '?'}`,
            ].join(' ');
            api.logger.info(`MiniRouter: ${decision.category} (conf=${(decision.confidence * 100).toFixed(0)}%) model=${decision.selectedModel} | ${meta} | ${decision.reasoning}`);
        }
        // ── Confidence Check ──
        if (decision.confidence < confidenceThreshold) {
            if (logDecisions) {
                api.logger.info(`MiniRouter: CONFIDENCE TOO LOW (${(decision.confidence * 100).toFixed(0)}% < ${(confidenceThreshold * 100).toFixed(0)}%) → no override`);
            }
            return undefined;
        }
        // ── Model Override ──
        if (decision.category === 'DEFAULT' || decision.category === 'bypass') {
            return undefined;
        }
        return {
            modelOverride: decision.selectedModel,
        };
    }, { priority: 10 });
}
// ── Named Exports für direkten Import (Testing / SDK-Nutzung) ──────
export { createRouter } from './router.js';
//# sourceMappingURL=index.js.map