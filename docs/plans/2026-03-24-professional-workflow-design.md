# Professional Drawing Workflow Design

**Date:** 2026-03-24
**Problem:** Claude in SVG Artist doesn't proactively use its three sub-agents (design-advisor, detail-painter, bootstrap-reviewer) during the drawing process. They're only triggered via manual slash commands (/design, /reference, /review), so most drawings skip research, detail refinement, and self-improvement.

## Root Cause Analysis

1. **Agents are positioned as "optional tools" not "workflow steps"** — The system prompt mentions agents only in the self-improvement section and slash command docs, not in the core drawing process
2. **No judgment criteria** — The prompt says "visualize, structure, build..." but never says "before building, dispatch design-advisor to research"
3. **Linear flow without agent integration** — The 6-step process (Visualize → Structure → Palette → Build → Review → Refine) treats everything as the main agent's solo work

## Design: 5-Phase Professional Workflow

Replace the current 6-step drawing process with a 5-phase workflow that embeds agent calls as core actions.

### Phase Overview

```
Phase 0: Research & Design  ←── design-advisor (visual research + proposals)
    ↓
Phase 1: Foundation         ←── canvas setup, defs, background
    ↓
Phase 2: Construction       ←── layers back-to-front, environment → subjects
    ↓
Phase 3: Detail & Polish    ←── detail-painter for fine details
    ↓
Phase 4: Critique & Evolve  ←── bootstrap-reviewer + 7-dimension self-review
    ↓ (iterate back to Phase 2/3 if needed)
```

### Phase Details

**Phase 0: Research & Design**
- Dispatch design-advisor to search references, analyze, propose 2-3 approaches
- Select approach: palette, composition strategy, layer plan
- Skip condition: trivially simple requests ("draw a red circle", "add a border")
- Judgment: "If the request describes a meaningful visual scene, character, or composition → research first"

**Phase 1: Foundation**
- Set canvas viewBox
- Define shared resources (gradients, patterns, filters) via manage_defs
- Draw background layers
- preview_as_png to confirm foundation

**Phase 2: Construction**
- Build layers: background → midground → foreground
- Every 3-4 operations → preview_as_png
- Mark areas needing fine detail for Phase 3 (use placeholder shapes, continue building)

**Phase 3: Detail & Polish**
- Dispatch detail-painter for marked fine-detail areas (eyes, hands, hair, textures)
- Review scratch canvas results, merge into main drawing
- Apply filters and effects
- Skip condition: no fine-detail elements in the drawing

**Phase 4: Critique & Evolve**
- preview_as_png → 7-dimension self-critique
- Dispatch bootstrap-reviewer to identify capability gaps
- Decision: iterate (back to Phase 2/3), implement bootstrap improvements, or finalize
- Skip condition: very simple task AND self-review is satisfactory

### Fast Path

For simple operations completable in 1-3 MCP tool calls (shape additions, color changes, layout tweaks): execute directly without the full 5-phase workflow.

## Changes Required

### 1. `server/pty-manager.ts` — Rewrite systemPrompt drawing process

Replace "THE DRAWING PROCESS" section (current 6 steps) with the 5-phase workflow:
- Phase 0 with design-advisor as core action
- Phases 1-2 consolidated from current steps 2-4
- Phase 3 with detail-painter as core action
- Phase 4 with bootstrap-reviewer as core action
- Fast path judgment criteria
- Strong but non-mandatory language ("you should", "professional artists always")

### 2. `plugins/svg-drawing/skills/layer-workflow/SKILL.md` — Sync workflow phases

Update the "Recommended Workflow: 5 Phases" section to align with the new flow:
- Add Phase 0 (Research) with design-advisor reference
- Update Phase 4 (Details) to mention detail-painter triggers
- Update Phase 5 (Review) to mention bootstrap-reviewer
- Add fast path note

## What's NOT Changed

- Agent definition files (already well-written)
- Command files (users can still manually invoke /design, /reference, /review)
- Other skills (technical references, not workflow)
- Backend logic (no code functionality changes)
- MCP tools (no new tools needed)
