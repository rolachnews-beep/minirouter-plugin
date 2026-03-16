# MiniRouter — Intelligente Model-Auswahl für OpenClaw

**MiniRouter** ist ein Plugin für OpenClaw, das automatisch das beste KI-Modell für jede Anfrage auswählt. Du musst dich nicht mehr entscheiden, welches Modell du verwenden sollst — MiniRouter erledigt das für dich.

---

## 🎯 Was macht MiniRouter?

Stell dir vor, du stellst OpenClaw verschiedene Fragen:

| Du fragst... | MiniRouter wählt... | Warum? |
|---|---|---|
| "Wie spät ist es?" | Ein schnelles, billiges Modell | Einfache Frage → Tier: SIMPLE |
| "Schreib mir eine Python-Funktion" | Ein Coding-Modell | Code braucht spezialisierte Modelle → Tier: MEDIUM |
| "Entwerfe eine Microservice-Architektur" | Ein starkes Modell | Komplexe Aufgabe → Tier: COMPLEX |
| "Beweise den Satz von Pythagoras" | Ein Reasoning-Modell | Logik + Mathematik → Tier: REASONING |
| "Erzähl mir eine Sci-Fi Geschichte" | Ein kreatives Modell | Kreativität → Tier: CREATIVE |
| "Lies die Datei, fix den Bug, dann deploy" | Ein starkes Agent-Modell | Multi-Step Aufgabe → Tier: AGENTIC |

**Das Ergebnis:** Du sparst Geld (kleine Modelle sind billiger) und bekommst bessere Antworten (jedes Modell macht, was es am besten kann).

---

## 📦 So funktioniert es

MiniRouter analysiert jede Anfrage über **15 gewichtete Dimensionen** (inspiriert von [ClawRouter](https://github.com/BlockRunAI/ClawRouter)):

### Die 15 Dimensionen

| # | Dimension | Was sie misst | Gewicht |
|---|-----------|---------------|---------|
| 1 | **Token Count** | Wie lang ist der Prompt? | 8% |
| 2 | **Code Presence** | Enthält der Prompt Code-Keywords? | 15% |
| 3 | **Reasoning Markers** | Braucht es Logik/Mathematik? | 18% |
| 4 | **Technical Terms** | Sind technische Begriffe dabei? | 10% |
| 5 | **Creative Markers** | Ist es eine kreative Aufgabe? | 5% |
| 6 | **Simple Indicators** | Ist es eine einfache Frage? | 2% |
| 7 | **Multi-Step Patterns** | Gibt es "first...then" Muster? | 10% |
| 8 | **Question Complexity** | Wie viele Fragezeichen? | 5% |
| 9 | **Imperative Verbs** | "Bauen", "Erstellen", "Implementieren"? | 3% |
| 10 | **Constraint Indicators** | "Höchstens", "Mindestens", Budget? | 4% |
| 11 | **Output Format** | JSON, YAML, Tabelle gewünscht? | 3% |
| 12 | **Reference Complexity** | Verweist der Prompt auf anderem Text? | 2% |
| 13 | **Negation Complexity** | "Nicht", "Ohne", "Vermeide"? | 1% |
| 14 | **Domain Specificity** | Quantum, FPGA, Genomics? | 2% |
| 15 | **Agentic Task** | File-Ops, Deploy, Iterieren? | 4% |

### Das Tier-System

Jede Anfrage wird in ein **Tier** einsortiert:

```
SIMPLE ←→ MEDIUM ←→ COMPLEX ←→ REASONING
                        ↑
                   CREATIVE (parallel)
                   AGENTIC (parallel)
```

- **SIMPLE** — Einfache Fragen, Fakten, Begrüßungen
- **MEDIUM** — Code, Erklärungen, Tutorials
- **COMPLEX** — Architektur, Analyse, Optimierung
- **REASONING** — Beweise, Mathematik, Logik
- **CREATIVE** — Geschichten, Gedichte, Brainstorming
- **AGENTIC** — Multi-Step Tasks, File-Ops, Deployment

### Sonderfälle (Overrides)

MiniRouter hat eingebaute Regeln für Sonderfälle:

- **Großer Prompt** (>25.000 Tokens) → automatisch COMPLEX
- **Strukturierte Ausgabe** (JSON, YAML) → mindestens MEDIUM
- **Hohe max_tokens** (>4.000) → REASONING
- **2+ Reasoning-Keywords** → REASONING (selbst bei niedrigem Score)
- **3+ Agentic-Keywords** → AGENTIC (selbst bei niedrigem Score)

### Multi-Sprachige Erkennung

MiniRouter versteht Keywords in **9 Sprachen**:
🇬🇧 English · 🇩🇪 Deutsch · 🇨🇳 中文 · 🇯🇵 日本語 · 🇷🇺 Русский · 🇪🇸 Español · 🇧🇷 Português · 🇰🇷 한국어 · 🇸🇦 العربية

### Confidence Calibration

MiniRouter gibt eine **Confidence** (0–100%) mit jeder Entscheidung. Niedrige Confidence → das Model ist sich unsicher → Fallback auf DEFAULT.

---

## 🚀 Installation in OpenClaw

### Schritt 1: Plugin herunterladen

Öffne dein Terminal auf dem Server wo OpenClaw läuft und gib ein:

```bash
cd ~/.openclaw
git clone https://github.com/rolachnews-beep/minirouter-plugin.git plugins/minirouter
cd plugins/minirouter
npm install
npm run build
```

### Schritt 2: OpenClaw Config bearbeiten

Öffne die Datei `~/.openclaw/openclaw.json` und füge das Plugin hinzu.

**Finde den `plugins`-Abschnitt** (oder erstelle ihn, falls er nicht existiert) und kopiere Folgendes:

```json
{
  "plugins": {
    "allow": ["minirouter"],
    "entries": {
      "minirouter": {
        "config": {
          "defaultModel": "openrouter/meta-llama/llama-3.1-8b-instruct"
        }
      }
    }
  }
}
```

> **Wichtig:** Falls `plugins` schon existiert, füge `"minirouter"` zur `allow`-Liste hinzu und den `minirouter`-Eintrag unter `entries` dazu — überschreibe nicht die bestehenden Einträge!

### Schritt 3: OpenClaw neu starten

```bash
openclaw gateway restart
```

Fertig! MiniRouter ist jetzt aktiv.

---

## ⚙️ Konfiguration

### Modelle anpassen

Standardmäßig verwendet MiniRouter diese Modelle pro Tier:

| Tier | Primary Model | Fallback |
|------|---------------|----------|
| SIMPLE | gemini-2.5-flash-lite | llama-3.1-8b, gemma-2-9b |
| MEDIUM | gemini-2.5-flash | kimi-k2.5, deepseek-chat |
| COMPLEX | claude-sonnet-4.6 | gemini-3.1-pro, gpt-4o |
| REASONING | o4-mini | grok-4-1-fast-reasoning, deepseek-reasoner |
| CREATIVE | claude-sonnet-4.6 | mistral-large |
| AGENTIC | claude-sonnet-4.6 | gemini-3.1-pro |

### Eigene Modelle konfigurieren

Erweitere die Plugin-Config in `openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "minirouter": {
        "config": {
          "defaultModel": "openrouter/meta-llama/llama-3.1-8b-instruct",
          "categories": [
            {
              "name": "SIMPLE",
              "models": ["openrouter/mein/eigenes-modell"],
              "keywords": ["hallo", "hi", "was ist"],
              "useCases": ["simple-qa"]
            }
          ]
        }
      }
    }
  }
}
```

### Optionen

| Option | Standard | Beschreibung |
|--------|----------|-------------|
| `defaultModel` | `openrouter/google/gemini-2.5-flash-lite` | Fallback-Modell |
| `categories` | (eingebaute 6 Tiers) | Eigene Kategorien definieren |
| `timeoutMs` | `10` | Maximalzeit für Routing in ms |

---

## 🔧 Für Entwickler

### Projektstruktur

```
minirouter-plugin/
├── src/
│   ├── index.ts      ← Plugin Entry Point + Factory
│   ├── router.ts     ← 15-Dimension Scoring Engine
│   ├── models.ts     ← 6 Tier-Kategorien (9 Sprachen)
│   └── types.ts      ← TypeScript Interfaces
├── dist/             ← Kompiliert (nach npm run build)
├── package.json
├── tsconfig.json
└── README.md
```

### Als Modul nutzen

```typescript
import { createMiniRouter } from '@openclaw/minirouter';

const mr = createMiniRouter();

// Routing-Entscheidung holen
const decision = await mr.decide({
  prompt: 'Beweise den Satz von Pythagoras schritt für schritt'
});

console.log(decision);
// {
//   selectedModel: 'openrouter/openai/o4-mini',
//   category: 'REASONING',
//   confidence: 0.92,
//   reasoning: 'Score: 0.523 | Tier: REASONING | Signals: reasoning (beweise, schritt für schritt)',
//   latencyMs: 1
// }
```

### Keywords erweitern

Bearbeite `src/models.ts` um Keywords hinzuzufügen. Danach:

```bash
cd ~/.openclaw/plugins/minirouter
npm run build
openclaw gateway restart
```

---

## 🆚 Vergleich: MiniRouter vs. ClawRouter

| Feature | MiniRouter | ClawRouter |
|---------|-----------|------------|
| Scoring Dimensionen | 15 | 15 |
| Sprachen | 9 (EN,DE,ZH,JA,RU,ES,PT,KO,AR) | 9 |
| Confidence | Sigmoid Calibration | Sigmoid Calibration |
| Latenz | <1ms | <1ms |
| Tiers | 6 (incl. CREATIVE, AGENTIC) | 4 |
| Payment | OpenRouter API Key | USDC (x402) |
| Open Source | ✅ MIT | ✅ MIT |
| Override-Regeln | ✅ | ✅ |
| Agentic Detection | ✅ | ✅ |

---

## 📄 Lizenz

MIT — frei nutzbar und anpassbar.

---

## ❓ Häufige Fragen

**Muss ich OpenRouter haben?**
Ja, MiniRouter nutzt Modelle über OpenRouter. Du brauchst einen OpenRouter API-Key.

**Kann ich MiniRouter ausschalten?**
Ja, entferne `"minirouter"` aus der `allow`-Liste in der Config oder setze `enabled: false`.

**Was passiert bei niedriger Confidence?**
Das Default-Modell wird verwendet (standardmäßig gemini-2.5-flash-lite — schnell und billig).

**Kann ich nur bestimmte Tiers nutzen?**
Ja, definiere in der Config nur die Kategorien die du brauchst.

**Wie schnell ist das Routing?**
<1ms — alles läuft lokal, keine externen API-Calls nötig.
