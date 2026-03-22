# Design Advisor Upgrade — Integrated Research & Design Agent

## Summary

Merge `reference-searcher` into `design-advisor`, creating a single agent that researches reference images from the web, downloads and compresses them locally, analyzes them visually, and produces design proposals — all in one workflow.

## Current State

- **reference-searcher**: Haiku model, WebSearch + WebFetch only, returns text descriptions of references
- **design-advisor**: Sonnet model, no tools, pure reasoning, outputs 2-3 design approaches
- Two agents cannot call each other; orchestration is via system prompt in pty-manager.ts

## Design

### 1. Agent Changes

**design-advisor** (upgraded):
- Model: Sonnet (needs multimodal + reasoning)
- Tools: WebSearch, WebFetch, Bash (for curl download + sips compression), Read (to view downloaded images)
- New workflow: Research → Download → Compress → Analyze → Design

**reference-searcher** (retired):
- File kept but description updated to redirect users to design-advisor
- `/reference` command updated to invoke design-advisor in research-only mode

### 2. design-advisor Workflow

```
Phase 1: RESEARCH
  1. WebSearch for "[subject] illustration reference", "[subject] vector art style", "[subject] SVG flat design"
  2. WebFetch top results to identify high-quality reference image URLs
  3. Select 3-5 best reference images (prefer vector/flat/illustration style)

Phase 2: DOWNLOAD & COMPRESS
  4. mkdir -p data/references/<drawId>/
  5. curl -L -o data/references/<drawId>/ref-NNN.jpg <url> for each image
  6. sips --resampleWidth 800 <file> to compress (macOS built-in, zero deps)
  7. Target: each image < 200KB, max 5 images

Phase 3: ANALYZE
  8. Read each downloaded image (Claude multimodal vision)
  9. Extract: color palette, composition structure, shapes, style characteristics, proportions

Phase 4: DESIGN
  10. Generate 2-3 design approaches informed by reference analysis
  11. Each approach includes: composition, palette, layer structure, key techniques
  12. Include reference image paths so the drawing agent can review them
```

### 3. Output Format

```
## Reference Research

Downloaded N reference images to data/references/<drawId>/
- ref-001.jpg: [brief description of what this reference shows]
- ref-002.jpg: [brief description]
- ref-003.jpg: [brief description]

Key observations from references:
- Color trends: [common palettes observed]
- Composition patterns: [common layout approaches]
- Style characteristics: [shared visual traits]

## Design Approaches

Approach 1: [Style Name] — [Brief description]
  - References: Based on ref-001.jpg, ref-003.jpg
  - Composition: [Layout strategy]
  - Palette: #xxx, #xxx, #xxx, #xxx, #xxx
  - Layer structure: [Ordered layers]
  - Key techniques: [SVG techniques]

Approach 2: ...
```

### 4. System Prompt Changes (pty-manager.ts)

Update Step 2 in the workflow:
```
2. DESIGN: Use design-advisor agent to research and explore visual approaches.
   - Agent automatically searches web, downloads reference images, analyzes them
   - Presents 2-3 approaches informed by real visual references
   - Reference images saved to data/references/<drawId>/
   - Wait for user selection before proceeding
```

### 5. Cleanup

When a drawing is deleted (DELETE /api/drawings/:drawId):
- Also remove `data/references/<drawId>/` directory

### 6. File Changes

| File | Change |
|------|--------|
| `plugins/svg-drawing/agents/design-advisor.md` | Major rewrite: add tools, research workflow, new output format |
| `plugins/svg-drawing/agents/reference-searcher.md` | Deprecate, redirect to design-advisor |
| `plugins/svg-drawing/commands/design.md` | Update description to mention research phase |
| `plugins/svg-drawing/commands/reference.md` | Redirect to design-advisor |
| `server/pty-manager.ts` | Update Step 2 in system prompt |
| `server/index.ts` | Add cleanup of data/references/<drawId>/ on drawing delete |
| `.gitignore` | Add data/references/ |

### 7. Image Compression Strategy

Using `sips` (macOS built-in, zero new dependencies):
```bash
sips --resampleWidth 800 image.jpg    # scale to max 800px wide
sips --resampleHeight 600 image.png   # or max 600px tall
```

Constraints:
- Max 5 reference images per drawing
- Each image target < 200KB after compression
- Supported formats: jpg, png, webp (sips handles all)
