# @openclaw/minirouter

> OpenClaw Plugin - Automatische Model-Auswahl basierend auf Text-Determinanten

## Was ist das?

MiniRouter ist ein OpenClaw Plugin das automatisch das richtige Model auswählt basierend auf:
- **Keywords** im Prompt (coding, story, explain, etc.)
- **Task-Typ Erkennung** (coding, instruction, creative, analysis)
- **Sprache** (Deutsch, Englisch, etc.)
- **Prompt-Länge** (lange Prompts → reasoning Models)

## Installation

```bash
npm install @openclaw/minirouter
```

## Verwendung

```typescript
import { createMiniRouter } from '@openclaw/minirouter';

const router = createMiniRouter({
  defaultModel: 'openrouter/minimax/minimax-m2.5'
});

// Nur Routing-Entscheidung holen
const decision = await router.decide({
  prompt: 'Erkläre mir die Quantenphysik'
});

console.log(decision);
// {
//   selectedModel: 'openrouter/anthropic/claude-3.5-sonnet',
//   category: 'instruction',
//   confidence: 0.7,
//   reasoning: 'Task: instruction | Keywords: erkläre | Kategorie: instruction',
//   latencyMs: 2
// }
```

## Model-Kategorien

| Kategorie | Modelle | Erkennung |
|-----------|--------|----------|
| fast | llama-3.1-8b, gemma-2-9b | simple-qa, greeting |
| reasoning | o4-mini, qwen-2.5-32b | analysis, problem-solving |
| coding | deepseek-coder, qwen-coder | code, debug, implement |
| instruction | claude-3.5-sonnet, gpt-4o | explain, tutorial |
| creative | mistral-large | story, poem, creative |

## Als OpenClaw Plugin konfigurieren

In der OpenClaw Config:

```json
{
  "plugins": {
    "entries": {
      "minirouter": {
        "enabled": true,
        "config": {
          "defaultModel": "openrouter/minimax/minimax-m2.5",
          "categories": [...]
        }
      }
    }
  }
}
```

## API

### `createMiniRouter(options)`

Erstellt eine MiniRouter Instanz.

**Options:**
- `defaultModel` - Fallback Model (optional)
- `categories` - Eigene Kategorien definieren (optional)
- `timeoutMs` - Routing Timeout (default: 10ms)

### `router.decide(request)`

Nur Routing-Entscheidung holen (ohne API-Call).

### `router.complete(request)`

Request + API-Call (noch nicht implementiert).

### `router.healthCheck()`

Prüft ob Router funktioniert.

## Lizenz

MIT