# MiniRouter — Intelligente Model-Auswahl für OpenClaw

**MiniRouter** ist ein Plugin für OpenClaw, das automatisch das beste KI-Modell für jede Anfrage auswählt. Du musst dich nicht mehr entscheiden, welches Modell du verwenden sollst — MiniRouter erledigt das für dich.

---

## 🎯 Was macht MiniRouter?

Stell dir vor, du stellst OpenClaw verschiedene Fragen:

| Du fragst... | MiniRouter wählt... | Warum? |
|---|---|---|
| "Wie spät ist es?" | Ein schnelles, kleines Modell | Einfache Frage, braucht kein starkes Modell |
| "Schreib mir eine Python-Funktion" | Ein Coding-Modell | Code braucht spezialisierte Modelle |
| "Erkläre mir Quantenphysik" | Ein starkes Sprachmodell | Komplexe Erklärungen brauchen Qualität |
| "Erzähl mir eine Geschichte" | Ein kreatives Modell | Kreativität braucht ein anderes Modell |
| "Analysiere dieses Problem" | Ein Reasoning-Modell | Logik und Analyse brauchen Tiefgang |

**Das Ergebnis:** Du sparst Geld (kleine Modelle sind billiger) und bekommst bessere Antworten (jedes Modell macht, was es am besten kann).

---

## 📦 So funktioniert es

MiniRouter analysiert jede Anfrage anhand von drei Signalen:

1. **Keywords** — Wörter wie "code", "erkläre", "story" verraten den Typ der Aufgabe
2. **Aufgaben-Typ** — Coding, Erklärungen, Kreativität, Analyse, oder einfache Fragen
3. **Sprache** — Erkennt Deutsch, Englisch und weitere Sprachen

Daraus wählt MiniRouter die passende **Model-Kategorie**:

- **Fast** — Schnelle Antworten für einfache Fragen (z.B. llama-3.1-8b)
- **Coding** — Code-Generierung und Debugging (z.B. deepseek-coder)
- **Instruction** — Erklärungen und Tutorials (z.B. claude-3.5-sonnet)
- **Creative** — Geschichten und kreatives Schreiben (z.B. mistral-large)
- **Reasoning** — Analyse und komplexe Probleme (z.B. o4-mini)

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

> **Hinweis:** Falls `plugins` schon existiert, füge `"minirouter"` zur `allow`-Liste hinzu und den `minirouter`-Eintrag unter `entries` dazu — überschreibe nicht die bestehenden Einträge!

### Schritt 3: OpenClaw neu starten

```bash
openclaw gateway restart
```

Fertig! MiniRouter ist jetzt aktiv.

---

## ⚙️ Konfiguration

### Model anpassen

Standardmäßig verwendet MiniRouter diese Modelle:

- **Fast:** `openrouter/meta-llama/llama-3.1-8b-instruct`
- **Reasoning:** `openrouter/openai/o4-mini`
- **Coding:** `openrouter/deepseek/deepseek-coder`
- **Instruction:** `openrouter/anthropic/claude-3.5-sonnet`
- **Creative:** `openrouter/mistralai/mistral-large`

Um eigene Modelle zu konfigurieren, erweitere die Plugin-Config:

```json
{
  "plugins": {
    "entries": {
      "minirouter": {
        "config": {
          "defaultModel": "openrouter/meta-llama/llama-3.1-8b-instruct",
          "categories": [
            {
              "name": "fast",
              "models": ["openrouter/meta-llama/llama-3.1-8b-instruct"],
              "keywords": ["hi", "hallo", "hello", "quick", "simple"],
              "useCases": ["simple-qa", "greeting"]
            },
            {
              "name": "coding",
              "models": ["openrouter/deepseek/deepseek-coder"],
              "keywords": ["code", "function", "debug", "implement", "bug"],
              "useCases": ["code-generation", "debugging"]
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
|---|---|---|
| `defaultModel` | `openrouter/meta-llama/llama-3.1-8b-instruct` | Fallback-Modell wenn nichts erkannt wird |
| `categories` | (eingebaute Kategorien) | Eigene Model-Kategorien definieren |
| `timeoutMs` | `10` | Maximalzeit für Routing-Entscheidung in Millisekunden |

---

## 🔧 Für Entwickler

### Projektstruktur

```
minirouter-plugin/
├── src/
│   ├── index.ts      ← Plugin Entry Point
│   ├── router.ts     ← Routing-Logik
│   ├── models.ts     ← Model-Kategorien
│   └── types.ts      ← TypeScript Interfaces
├── dist/             ← Kompiliertes Plugin (nach npm run build)
├── package.json
├── tsconfig.json
└── README.md
```

### Eigene Keywords hinzufügen

Bearbeite `src/models.ts` um neue Keywords oder Kategorien hinzuzufügen:

```typescript
{
  name: 'my-custom',
  models: ['openrouter/mein/modell'],
  keywords: ['spezialwort', 'anderes-wort'],
  useCases: ['mein-anwendungsfall']
}
```

Danach neu kompilieren:

```bash
cd ~/.openclaw/plugins/minirouter
npm run build
openclaw gateway restart
```

---

## 📄 Lizenz

MIT — frei nutzbar und anpassbar.

---

## ❓ Häufige Fragen

**Muss ich OpenRouter haben?**
Ja, MiniRouter nutzt Modelle über OpenRouter. Du brauchst einen OpenRouter API-Key.

**Kann ich MiniRouter ausschalten?**
Ja, entferne `"minirouter"` aus der `allow`-Liste in der Config oder setze `enabled: false`.

**Was passiert wenn kein Modell erkannt wird?**
Dann wird das `defaultModel` verwendet (standardmäßig llama-3.1-8b — schnell und billig).

**Kann ich nur bestimmte Kategorien nutzen?**
Ja, definiere in der Config nur die Kategorien die du brauchst unter `categories`.
