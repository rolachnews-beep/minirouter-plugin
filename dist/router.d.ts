import { MiniRouterRequest, RoutingDecision, ModelCategory } from './types.js';
/**
 * MiniRouter — Intelligenter Model-Router für OpenClaw
 */
export declare class Router {
    private categories;
    private defaultModel;
    constructor(options?: {
        categories?: ModelCategory[];
        defaultModel?: string;
    });
    /**
     * Hauptmethode: Entscheidet welches Model verwendet werden soll.
     */
    route(request: MiniRouterRequest): Promise<RoutingDecision>;
    private checkOverrides;
    /** Dimension 1: Token Count */
    private scoreTokenCount;
    /** Dimension 2-6: Keyword-Matching gegen Kategorie-Keywords */
    private scoreKeywordDimension;
    /** Dimension 7: Multi-Step Patterns */
    private scoreMultiStep;
    /** Dimension 8: Question Complexity (multiple ?) */
    private scoreQuestionComplexity;
    /** Dimension 9: Imperative Verbs */
    private scoreImperativeVerbs;
    /** Dimension 10: Constraint Indicators */
    private scoreConstraints;
    /** Dimension 11: Output Format */
    private scoreOutputFormat;
    /** Dimension 12: Reference Complexity */
    private scoreReferences;
    /** Dimension 13: Negation Complexity */
    private scoreNegation;
    /** Dimension 14: Domain-Specific Keywords */
    private scoreDomainSpecific;
    /** Dimension 15: Agentic Task */
    private scoreAgenticTask;
    /** Holt Keywords einer Kategorie */
    private getCategoryKeywords;
    /** Map weighted score zu Tier (4-stufig: SIMPLE → MEDIUM → COMPLEX → REASONING) */
    private selectTier;
    /** Sigmoid Confidence Calibration */
    private sigmoid;
}
export declare function createRouter(options?: {
    categories?: ModelCategory[];
    defaultModel?: string;
}): Router;
//# sourceMappingURL=router.d.ts.map