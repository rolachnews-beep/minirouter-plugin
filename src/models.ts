import { ModelCategory } from './types.js';

/**
 * Model-Kategorien für MiniRouter
 * 
 * Jede Kategorie hat:
 * - name: Eindeutiger Name
 * - models: Liste der Models (erstes wird verwendet)
 * - keywords: Keywords zur Erkennung
 * - useCases: Task-Typen die diese Kategorie verwenden soll
 */
export const MODEL_CATEGORIES: ModelCategory[] = [
  {
    name: 'fast',
    models: [
      'openrouter/meta-llama/llama-3.1-8b-instruct',
      'openrouter/google/gemma-2-9b-instruct'
    ],
    keywords: [
      'hi', 'hello', 'hey', 'quick', 'simple', 'what is', 'was ist',
      '天气预报', '天气', '温度'
    ],
    useCases: ['simple-qa', 'summarization', 'greeting']
  },
  {
    name: 'reasoning',
    models: [
      'openrouter/openai/o4-mini',
      'openrouter/qwen/qwen-2.5-32b-instruct'
    ],
    keywords: [
      'analyze', 'analyse', 'analyze', 'reasoning', 'logik',
      'problem', 'lösung', 'math', 'berechne'
    ],
    useCases: ['analysis', 'problem-solving', 'math']
  },
  {
    name: 'coding',
    models: [
      'openrouter/deepseek/deepseek-coder',
      'openrouter/qwen/qwen-coder-32b-instruct'
    ],
    keywords: [
      'code', 'function', 'class', 'debug', 'implement',
      'program', 'script', 'api', 'error', 'bug'
    ],
    useCases: ['code-generation', 'debugging', 'refactoring']
  },
  {
    name: 'instruction',
    models: [
      'openrouter/anthropic/claude-3.5-sonnet',
      'openrouter/openai/gpt-4o'
    ],
    keywords: [
      'explain', 'erkläre', 'tutorial', 'how to', 'what is',
      'beschreibe', 'zeige mir', 'learn', 'verstehe'
    ],
    useCases: ['instruction', 'tutorials', 'explanations']
  },
  {
    name: 'creative',
    models: [
      'openrouter/mistralai/mistral-large'
    ],
    keywords: [
      'story', 'geschichte', 'poem', 'gedicht', 'creative',
      'schreibe', 'erzähl', 'fantasy', 'roman'
    ],
    useCases: ['storytelling', 'poetry', 'creative-writing']
  }
];

/**
 * Fallback-Kategorie wenn keine Erkennung möglich
 */
export function getDefaultCategory(): ModelCategory {
  return MODEL_CATEGORIES[0]; // 'fast' als Default
}