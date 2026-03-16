# MiniRouter v2.1 — Intelligente Model-Auswahl für OpenClaw

**MiniRouter** ist ein OpenClaw-Plugin, das automatisch das beste KI-Modell für jede Anfrage auswählt. Keine manuelle Model-Konfiguration mehr — MiniRouter analysiert jeden Prompt und routet zum passenden Modell.

---

## 🎯 Was macht MiniRouter?

| Du fragst... | MiniRouter wählt... | Warum? |
|---|---|---|
| "Wie spät ist es?" | llama-3.1-8b | Einfache Frage → SIMPLE |
| "Schreib mir eine Python-Funktion" | glm-5 | Code braucht spezialisierte Modelle → MEDIUM |
| "Entwerfe eine Microservice-Architektur" | claude-sonnet-4.6 | Komplexe Aufgabe → COMPLEX |
| "Beweise den Satz von Pythagoras" | minimax-m2.5 | Logik + Mathematik → REASONING |
| "Erzähl mir eine Sci-Fi Geschichte" | claude-sonnet-4.6 | Kreativität → CREATIVE |
| "Lies die Datei, fix den Bug, dann deploy" | claude-sonnet-4.6 | Multi-Step Aufgabe → AGENTIC |

**Das Ergebnis:** Du sparst Geld (kleine Modelle sind billiger) und bekommst bessere Antworten.

---

## ⚡ So funktioniert es

MiniRouter nutzt den **`before_model_resolve`** Lifecycle Hook von OpenClaw. Vor jedem LLM-Request wird der User-Prompt analysiert und (wenn die Confidence hoch genug ist) das Modell überschrieben.

### Die 15 Scoring-Dimensionen

| # | Dimension | Gewicht |
|---|-----------|---------|
| 1 | Token Count | 9% |
| 2 | Code Presence | 16% |
| 3 | Reasoning Markers | 19% |
| 4 | Technical Terms | 11% |
| 5 | Creative Markers | 6% |
| 6 | Simple Indicators | 3% |
| 7 | Multi-Step Patterns | 10% |
| 8 | Question Complexity | 5% |
| 9 | Imperative Verbs | 4% |
| 10 | Constraint Indicators | 4% |
| 11 | Output Format | 3% |
| 12 | Reference Complexity | 2% |
| 13 | Negation Complexity | 2% |
| 14 | Domain Specificity | 3% |
| 15 | Agentic Task | 3% |

### 6 Tiers

- **SIMPLE** — Einfache Fragen, Fakten, Begrüßungen → llama-3.1-8b
- **MEDIUM** — Code, Erklärungen, Tutorials → glm-5
- **COMPLEX** — Architektur, Analyse, Optimierung → claude-sonnet-4.6
- **REASONING** — Beweise, Mathematik, Logik → minimax-m2.5
- **CREATIVE** — Geschichten, Gedichte, Brainstorming → claude-sonnet-4.6
- **AGENTIC** — Multi-Step Tasks, File-Ops, Deployment → claude-sonnet-4.6

### Smart Bypass

MiniRouter routet **nicht** bei:
- **Heartbeat** Polls → Default-Modell
- **Cron** Jobs → Default-Modell
- **Memory** Events → Default-Modell

Diese nutzen immer das konfigurierte Standard-Modell (kein Overhead).

### Confidence Calibration

Jede Entscheidung hat eine **Confidence** (0–100%). Unter dem Schwellenwert (default 70%) wird nicht geroutet → das Standard-Modell bleibt aktiv. So werden Fehlroutings vermieden.

### Override-Regeln

- Großer Prompt (>25K Tokens) → automatisch COMPLEX
- Strukturierte Ausgabe (JSON, YAML) → mindestens MEDIUM
- Hohe max_tokens (>4K) → REASONING
- 2+ Reasoning-Keywords → REASONING (selbst bei niedrigem Score)
- 2+ Creative-Keywords → CREATIVE (selbst bei niedrigem Score)
- 3+ Agentic-Keywords → AGENTIC (selbst bei niedrigem Score)

### Multi-Sprachige Erkennung

Keywords in **9 Sprachen**: 🇬🇧 English · 🇩🇪 Deutsch · 🇨🇳 中文 · 🇯🇵 日本語 · 🇷🇺 Русский · 🇪🇸 Español · 🇧🇷 Português · 🇰🇷 한국어 · 🇸🇦 العربية

---

## 🚀 Installation

### Option A: Von GitHub (empfohlen)

```bash
cd ~/.openclaw
git clone https://github.com/rolachnews-beep/minirouter-plugin.git extensions/minirouter
cd extensions/minirouter
npm install
npm run build
```

### Option B: Lokal entwickeln

```bash
openclaw plugins install ./pfad/zum/minirouter-plugin
```

### Schritt 2: OpenClaw Config

Füge MiniRouter zur Config hinzu:

```json
{
  "plugins": {
    "allow": ["minirouter"],
    "entries": {
      "minirouter": {
        "config": {
          "defaultModel": "openrouter/minimax/minimax-m2.5",
          "confidenceThreshold": 0.70,
          "logDecisions": false
        }
      }
    }
  }
}
```

> **Wichtig:** `"minirouter"` zur `allow`-Liste hinzufügen und den Eintrag unter `entries` hinzufügen — bestehende Einträge nicht überschreiben!

### Schritt 3: Restart

```bash
openclaw gateway restart
```

Fertig! MiniRouter ist jetzt aktiv und routet automatisch.

---

## ⚙️ Konfiguration

| Option | Default | Beschreibung |
|--------|---------|-------------|
| `defaultModel` | `openrouter/minimax/minimax-m2.5` | Fallback-Modell |
| `confidenceThreshold` | `0.70` | Mindest-Confidence für Override |
| `logDecisions` | `false` | Routing-Entscheidungen loggen |
| `bypassTriggers` | `["heartbeat","cron","memory"]` | Triggers die nicht geroutet werden |

### Modelle pro Tier

| Tier | Primary | Fallback |
|------|---------|----------|
| SIMPLE | llama-3.1-8b | gemma-2-9b |
| MEDIUM | glm-5 | gemini-2.5-flash, deepseek-chat |
| COMPLEX | claude-sonnet-4.6 | gemini-3.1-pro, gpt-4o |
| REASONING | minimax-m2.5 | o4-mini, grok-4-1-fast-reasoning |
| CREATIVE | claude-sonnet-4.6 | mistral-large |
| AGENTIC | claude-sonnet-4.6 | gemini-3.1-pro |

---

## 🔧 Für Entwickler

### Architektur

```
minirouter-plugin/
├── openclaw.plugin.json    ← Plugin Manifest (ID + Config Schema)
├── package.json            ← openclaw.extensions Entry Point
├── src/
│   ├── index.ts            ← Plugin register() + before_model_resolve Hook
│   ├── router.ts           ← 15-Dimension Scoring Engine
│   ├── models.ts           ← 6 Tiers (9 Sprachen, Keywords)
│   └── types.ts            ← TypeScript Interfaces
├── dist/                   ← Kompiliert (nach npm run build)
└── README.md
```

### Wie der Hook funktioniert

```typescript
// Jeder Prompt läuft durch diesen Flow:
api.on("before_model_resolve", async (event, ctx) => {
  const decision = router.route({ prompt: event.prompt });
  if (decision.confidence >= 0.70) {
    return { modelOverride: decision.selectedModel };
  }
  // undefined = kein Override, Standard-Modell bleibt
});
```

### Direct Import (Testing)

```typescript
import { createRouter } from './dist/router.js';

const router = createRouter({ defaultModel: 'openrouter/minimax/minimax-m2.5' });
const decision = await router.route({ prompt: 'Beweise den Satz von Pythagoras' });

console.log(decision);
// { selectedModel: 'openrouter/minimax/minimax-m2.5', category: 'REASONING', confidence: 0.92, ... }
```

---

## 🆚 MiniRouter vs. ClawRouter

| Feature | MiniRouter | ClawRouter |
|---------|-----------|------------|
| Integration | OpenClaw Plugin (Lifecycle Hook) | Standalone Proxy |
| Scoring | 15 Dimensionen | 15 Dimensionen |
| Sprachen | 9 | 9 |
| Confidence | Sigmoid Calibration | Sigmoid Calibration |
| Latenz | <1ms (in-process) | <1ms |
| Tiers | 6 (incl. CREATIVE, AGENTIC) | 4 |
| Payment | OpenRouter API Key | USDC (x402) |
| Open Source | ✅ MIT | ✅ MIT |

---

## 📄 Lizenz

MIT — frei nutzbar und anpassbar.
