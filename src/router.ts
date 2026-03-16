import { MODEL_CATEGORIES, getDefaultCategory } from './models.js';
import { MiniRouterRequest, RoutingDecision, ModelCategory } from './types.js';

/**
 * MiniRouter - Intelligenter Model-Router für OpenClaw
 * 
 * Wählt automatisch das richtige Model basierend auf:
 * - Keywords im Prompt
 * - Task-Typ Erkennung
 * - Sprache
 * - Prompt-Länge
 */
export class Router {
  private categories: ModelCategory[] = MODEL_CATEGORIES;
  
  /**
   * Hauptmethode: Entscheidet welches Model verwendet werden soll
   */
  async route(request: MiniRouterRequest): Promise<RoutingDecision> {
    const startTime = Date.now();
    
    // Wenn Model explizit angegeben, direkt verwenden
    if (request.model) {
      return {
        selectedModel: request.model,
        category: 'explicit',
        confidence: 1.0,
        reasoning: 'Model explizit angegeben',
        latencyMs: Date.now() - startTime
      };
    }
    
    // Routing basierend auf Prompt-Analyse
    const context = this.analyzePrompt(request.prompt);
    const category = this.findBestCategory(context, request);
    
    return {
      selectedModel: category.models[0],
      category: category.name,
      confidence: this.calculateConfidence(context, category),
      reasoning: this.generateReasoning(context, category),
      latencyMs: Date.now() - startTime
    };
  }
  
  /**
   * Analysiere den Prompt für Routing-Entscheidung
   */
  private analyzePrompt(prompt: string): { 
    charCount: number; 
    wordCount: number; 
    keywords: string[];
    task?: string;
    language?: string;
  } {
    const lowerPrompt = prompt.toLowerCase();
    const words = prompt.split(/\s+/);
    
    // Detektiere Keywords
    const allKeywords = this.categories.flatMap(c => c.keywords);
    const foundKeywords = allKeywords.filter(kw => lowerPrompt.includes(kw));
    
    // Detektiere Sprache
    let language: string | undefined;
    if (/\b(der|die|das|und|ist|nicht|ein|eine)\b/i.test(prompt)) language = 'de';
    if (/\b(the|and|is|not|a|an|in)\b/i.test(prompt)) language = 'en';
    
    // Detektiere Task-Typ
    let task: string | undefined;
    if (lowerPrompt.includes('code') || lowerPrompt.includes('function') || lowerPrompt.includes('function')) task = 'coding';
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('erkläre') || lowerPrompt.includes('tutorial')) task = 'instruction';
    if (lowerPrompt.includes('story') || lowerPrompt.includes('geschichte') || lowerPrompt.includes('poem')) task = 'creative';
    if (lowerPrompt.includes('analyze') || lowerPrompt.includes('analyse') || lowerPrompt.includes('problem')) task = 'analysis';
    
    return {
      charCount: prompt.length,
      wordCount: words.length,
      keywords: foundKeywords,
      task,
      language
    };
  }
  
  /**
   * Finde beste Kategorie basierend auf Analyse
   */
  private findBestCategory(
    context: ReturnType<Router['analyzePrompt']>,
    request: MiniRouterRequest
  ): ModelCategory {
    // Keyword-Matching
    if (context.keywords.length > 0) {
      for (const category of this.categories) {
        const matchCount = context.keywords.filter(kw => 
          category.keywords.includes(kw)
        ).length;
        if (matchCount > 0) return category;
      }
    }
    
    // Task-basiertes Routing
    if (context.task) {
      const taskCategory = this.categories.find(c => 
        c.useCases.includes(context.task!)
      );
      if (taskCategory) return taskCategory;
    }
    
    // Token-basiertes Routing (lange Prompts -> reasoning)
    if (request.max_tokens && request.max_tokens > 1000) {
      const reasoningCat = this.categories.find(c => c.name === 'reasoning');
      if (reasoningCat) return reasoningCat;
    }
    
    return getDefaultCategory();
  }
  
  /**
   * Berechne Confidence der Entscheidung
   */
  private calculateConfidence(
    context: ReturnType<Router['analyzePrompt']>,
    category: ModelCategory
  ): number {
    let confidence = 0.5;
    
    if (context.keywords.length > 0) confidence += 0.2;
    if (context.task) confidence += 0.2;
    
    return Math.min(confidence, 0.95);
  }
  
  /**
   * Generiere Begründung für Entscheidung
   */
  private generateReasoning(
    context: ReturnType<Router['analyzePrompt']>,
    category: ModelCategory
  ): string {
    const parts: string[] = [];
    
    if (context.task) {
      parts.push(`Task: ${context.task}`);
    }
    if (context.keywords.length > 0) {
      parts.push(`Keywords: ${context.keywords.slice(0, 3).join(', ')}`);
    }
    parts.push(`Kategorie: ${category.name}`);
    
    return parts.join(' | ');
  }
}

export const router = new Router();