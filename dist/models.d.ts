import { ModelCategory } from './types.js';
/**
 * MiniRouter v2 — Model-Kategorien mit Tier-System
 *
 * Inspiriert von ClawRouter's 15-dimensionaler gewichteter Scoring.
 * Jede Kategorie hat:
 * - name: Tier-Name (SIMPLE, MEDIUM, COMPLEX, REASONING)
 * - models: Liste der Modelle (erstes = primary, rest = fallback)
 * - keywords: Keywords zur Erkennung (multi-sprachig: EN, DE, ZH, JA, RU, ES, PT, KO, AR)
 * - useCases: Task-Typen die diese Kategorie verwenden soll
 */
export declare const MODEL_CATEGORIES: ModelCategory[];
/**
 * Fallback-Tier wenn keine Erkennung möglich
 */
export declare function getDefaultCategory(): ModelCategory;
//# sourceMappingURL=models.d.ts.map