# Self-Bootstrapping Architecture Design

## Overview

Enable the SVG Artist's Claude agent to self-improve by modifying its own skills, creating custom filters/styles/palettes, extending its system prompt, and reloading to apply changes — all without user intervention. The agent can identify capability gaps during a drawing task, build the tools it needs, reload, and automatically continue working.

## Decisions

- **Scope**: Incremental (Phase 1: Skills + Templates → Phase 2: MCP Tools → Phase 3: Engine)
- **Reload strategy**: Kill current Claude CLI + respawn with `--resume` + auto-inject continuation prompt
- **Safety**: Lightweight validation (directory restrictions + format checks)
- **Knowledge sharing**: Global — improvements from any drawing session benefit all future sessions

## Architecture

### Directory Layout

```
data/
├── drawings.json                         # Existing
├── references/<drawId>/                  # Existing
├── bootstrap/                            # NEW — all bootstrap data
│   ├── custom-filters/                   # Custom SVG filter definitions (JSON)
│   │   └── <name>.json
│   ├── custom-styles/                    # Custom style preset definitions (JSON)
│   │   └── <name>.json
│   ├── custom-palettes/                  # Custom palette definitions (JSON)
│   │   └── <name>.json
│   ├── custom-tools/                     # Phase 2: custom MCP tool definitions (JSON)
│   │   └── <name>.json
│   └── prompt-extensions/                # System prompt extension fragments (Markdown)
│       └── <name>.md
plugins/svg-drawing/
├── skills/                               # Existing — Claude can create/update directly
│   ├── svg-fundamentals/SKILL.md
│   ├── ... (existing 10 skills)
│   └── <new-skill>/SKILL.md              # Claude-created skills
├── agents/                               # Existing
└── commands/                             # Existing
```

`data/bootstrap/` is gitignored. Skills written to `plugins/svg-drawing/skills/` are committed to the repo (they're part of the plugin).

### JSON Definition Formats

**Custom Filter (`data/bootstrap/custom-filters/<name>.json`)**:
```json
{
  "name": "oil-paint",
  "description": "Oil painting effect with thick brush strokes",
  "svg_template": "<filter id=\"{{id}}\" ...>...</filter>",
  "params_schema": {
    "frequency": { "type": "number", "default": 0.02, "min": 0.005, "max": 0.1 },
    "displacement": { "type": "number", "default": 15, "min": 5, "max": 50 }
  },
  "created_by": "claude-bootstrap",
  "version": 1
}
```

Template syntax: `{{param:default}}` — server-side string replacement with validation against `params_schema`.

**Custom Style (`data/bootstrap/custom-styles/<name>.json`)**:
```json
{
  "name": "pixel-art",
  "description": "Pixel art style with sharp edges and limited palette",
  "layer_styles": {
    "*": { "shape-rendering": "crispEdges", "image-rendering": "pixelated" },
    "bg-*": { "fill": "#1a1a2e" }
  },
  "created_by": "claude-bootstrap",
  "version": 1
}
```

## Reload Mechanism (Kill + Resume + Auto-Continue)

### Flow

```
Claude calls reload_session({ reason: "Added pencil-sketch filter and skill" })
│
├── 1. MCP tool POSTs to /api/svg/<drawId>/bootstrap/reload
│
├── 2. Server-side:
│   ├── Save sessionId, callbackUrl, reason from current PtyManager
│   ├── Send "[Reloading with upgraded capabilities...]" to terminal WebSocket
│   ├── manager.kill()
│   ├── Wait 500ms
│   ├── manager.spawn({ sessionId, isResume: true, callbackUrl })
│   ├── Reattach existing WebSocket to new PTY process
│   └── Wait for CLI ready signal, then auto-inject continuation prompt
│
├── 3. Auto-injected prompt (written to PTY stdin):
│   ┌────────────────────────────────────────────────────────┐
│   │ I just upgraded my capabilities:                       │
│   │ - Added pencil-sketch filter and skill                 │
│   │                                                        │
│   │ Continue where I left off with the current task.       │
│   └────────────────────────────────────────────────────────┘
│
└── 4. Claude in new process:
    ├── Receives full conversation history via --resume
    ├── Receives auto-injected continuation prompt
    ├── Understands what was upgraded
    └── Automatically continues the drawing task using new capabilities
```

### Ready Detection

Claude CLI after `--resume` outputs a conversation summary then shows an input prompt. Detection strategy:

1. **Primary**: Monitor PTY output for prompt-ready pattern (e.g., idle after resume output)
2. **Fallback**: 10-second timeout — inject continuation prompt regardless

### Key Invariants

- **WebSocket stays connected**: Terminal WS is not closed during reload. Old PTY data handler is disposed, new one is attached to same WS.
- **SVG data safe**: Persisted in `drawings.json`, independent of CLI process.
- **Session context preserved**: `--resume sessionId` restores full conversation history.
- **Single-drawing scope**: Only the reloading drawing's CLI is affected. Other drawings continue uninterrupted.

## New MCP Bootstrap Tools (6 tools)

### Tool Definitions

| Tool | Description | Phase |
|------|-------------|-------|
| `write_skill` | Create/update a skill (SKILL.md) in plugins directory | 1 |
| `write_filter` | Create/update a custom SVG filter template (JSON) | 1 |
| `write_style` | Create/update a custom style preset (JSON) | 1 |
| `write_prompt_extension` | Add/update a system prompt extension (Markdown) | 1 |
| `reload_session` | Kill + resume CLI with auto-continuation. Apply all changes. | 1 |
| `list_bootstrap_assets` | List all custom skills, filters, styles, and prompt extensions | 1 |

### MCP Tool Schemas

```typescript
// write_skill
{ name: z.string(), content: z.string() }

// write_filter
{ name: z.string(), definition: z.object({
    description: z.string(),
    svg_template: z.string(),
    params_schema: z.record(z.string(), z.object({
      type: z.enum(['number', 'string']),
      default: z.union([z.number(), z.string()]),
      min: z.number().optional(),
      max: z.number().optional(),
    })).optional(),
  })
}

// write_style
{ name: z.string(), definition: z.object({
    description: z.string(),
    layer_styles: z.record(z.string(), z.record(z.string(), z.string())),
  })
}

// write_prompt_extension
{ name: z.string(), content: z.string() }

// reload_session
{ reason: z.string() }

// list_bootstrap_assets
{}
```

### Corresponding Server API Routes

```
POST /api/svg/:drawId/bootstrap/write-skill
POST /api/svg/:drawId/bootstrap/write-filter
POST /api/svg/:drawId/bootstrap/write-style
POST /api/svg/:drawId/bootstrap/write-prompt-extension
POST /api/svg/:drawId/bootstrap/reload
POST /api/svg/:drawId/bootstrap/list
```

## Validation (Lightweight)

| Asset | Validations |
|-------|------------|
| Skill name | kebab-case, no `..` or `/`, max 50 chars |
| Skill content | Non-empty, reasonable size (< 50KB) |
| Filter name | kebab-case, no path traversal |
| Filter svg_template | Must contain `<filter` tag, valid XML-like structure |
| Filter params_schema | Valid types, min ≤ default ≤ max |
| Style name | kebab-case, no path traversal |
| Style layer_styles | Non-empty, values are string key-value pairs |
| Prompt extension | Non-empty, < 10KB |

All write operations enforce path safety: names cannot contain `..`, `/`, `\`, or null bytes.

## Dynamic Loading in Existing Tools

### apply_filter Enhancement

The `filter/apply` API route changes to a two-tier lookup:

1. Check built-in filter builders (`filter-templates.ts` — existing 9 types)
2. If not found, check `data/bootstrap/custom-filters/<filter_type>.json`
3. If custom filter found, render template by replacing `{{param:default}}` placeholders with provided params (or defaults)

### apply_style_preset Enhancement

Same pattern: built-in presets first, then `data/bootstrap/custom-styles/`.

### Dynamic System Prompt

`PtyManager.spawn()` assembles `--append-system-prompt` by:
1. Base layer guide (existing hardcoded content)
2. + Concatenated content from `data/bootstrap/prompt-extensions/*.md`
3. + Self-improvement capability description

## System Prompt Addition

Appended to the existing `layerGuide` in `pty-manager.ts`:

```
Self-improvement capabilities:
- write_skill: Create/update drawing skills for future use
- write_filter: Create custom SVG filter templates
- write_style: Create custom style presets
- write_prompt_extension: Add to your own system prompt
- reload_session: Apply all changes (auto-restarts and continues)
- list_bootstrap_assets: View all custom assets

When you find your current tools insufficient for a task,
create the tools/skills you need, reload, and continue.
Batch multiple writes before a single reload for efficiency.
```

## Files to Modify

| File | Changes |
|------|---------|
| `server/pty-manager.ts` | Add `respawn()`, `buildDynamicPrompt()`, `waitForReadyAndInject()`, `injectContinuationPrompt()`, save spawn opts |
| `server/session-manager.ts` | Add `respawn(drawId)` delegating to PtyManager |
| `server/index.ts` | Add 6 bootstrap API routes, dynamic import of bootstrap-store |
| `server/mcp-server.ts` | Add 6 bootstrap tool definitions, modify `apply_filter` description to include custom filters |
| `server/filter-templates.ts` | Add `loadCustomFilter()` and template rendering logic |
| `server/style-presets.ts` | Add `loadCustomStyle()` |
| `server/bootstrap-validator.ts` | **NEW** — Path safety, format validation |
| `server/bootstrap-store.ts` | **NEW** — CRUD for `data/bootstrap/` directory |

## Incremental Roadmap

### Phase 1 (This Implementation)
- Skills read/write via MCP tool
- Custom filters, styles, prompt extensions
- Kill + Resume + auto-inject continuation
- Lightweight validation
- Asset listing

### Phase 2 (Future)
- Custom MCP tool definitions (JSON → dynamic tool registration)
- Custom API route handlers (TypeScript modules, dynamic import)
- Tool versioning and rollback

### Phase 3 (Future)
- svg-engine extensions (dynamic import of new capabilities)
- Server hot-reload (without affecting other sessions)
- Self-bootstrapping decision agent (auto-identifies improvement opportunities)

## Example End-to-End Scenario

```
User: Draw a pencil sketch style cat

Claude: (tries existing filters, finds them insufficient for realistic pencil look)
        (decides to self-bootstrap)

Claude → write_filter("pencil-sketch", { ... })
Claude → write_skill("pencil-sketch-technique", "# Pencil Sketch\n...")
Claude → reload_session("Added pencil-sketch filter and technique skill")

--- [Reloading with upgraded capabilities...] ---
--- [Resuming conversation...] ---

> I just upgraded my capabilities:
  - Added pencil-sketch filter and technique skill
  Continue where I left off with the current task.

Claude: (loads new skill, applies new filter, draws a better pencil-sketch cat)
        (all future drawings also have access to pencil-sketch capabilities)
```
