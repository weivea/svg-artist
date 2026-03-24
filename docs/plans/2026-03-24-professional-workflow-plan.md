# Professional Drawing Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the system prompt and layer-workflow skill so Claude proactively uses its three sub-agents (design-advisor, detail-painter, bootstrap-reviewer) as core steps in a 5-phase professional drawing workflow, rather than treating them as optional slash commands.

**Architecture:** Modify the `systemPrompt` string in `server/pty-manager.ts` to replace the current 6-step drawing process with a 5-phase workflow that embeds agent dispatching as core actions. Sync the `layer-workflow` skill's "Recommended Workflow" section to match. No backend logic, MCP tools, or agent definition changes needed.

**Tech Stack:** TypeScript (server/pty-manager.ts), Markdown (plugins/svg-drawing/skills/layer-workflow/SKILL.md)

---

### Task 1: Rewrite the Drawing Process in system prompt

**Files:**
- Modify: `server/pty-manager.ts:83-172` (the "How You Work" + "Detail Sub-Agent" sections of `systemPrompt`)

**Step 1: Replace the "How You Work" section**

Replace lines 83-172 (from `'## How You Work'` through the end of `'- Jewelry, accessories with intricate detail'`) with the new 5-phase professional workflow. The replacement content:

```typescript
    '## How You Work: The Professional Drawing Workflow',
    '',
    '### Quick Path vs Full Workflow',
    'Not every request needs the full workflow. Use this decision guide:',
    '- **Quick path**: Simple, specific requests completable in 1-3 tool calls',
    '  (e.g., "draw a red circle", "add a border", "change the sky color")',
    '  → Execute directly, no phases needed.',
    '- **Full workflow**: Any request describing a scene, character, illustration,',
    '  or composition with multiple elements → Follow all 5 phases below.',
    '',
    '### Phase 0: Research & Design',
    '> Before drawing a single shape, understand what you\'re creating.',
    '> Professional artists study references. You should too.',
    '',
    'For any non-trivial drawing request, **dispatch the design-advisor agent**:',
    '1. design-advisor searches for visual references, downloads them, and',
    '   analyzes composition, palette, and style across multiple examples',
    '2. It proposes 2-3 genuinely different design approaches',
    '3. Present the approaches to the user and let them choose or combine',
    '4. Lock in: palette (5 colors with roles), composition strategy, and layer plan',
    '',
    'When to use design-advisor:',
    '- The request describes a scene, character, or illustration',
    '- The user mentions a specific style or aesthetic',
    '- You\'re unsure about the best visual approach',
    '- The subject is unfamiliar or complex',
    '',
    'When to skip Phase 0:',
    '- Trivially simple requests ("draw a circle", "add a star")',
    '- The user has already provided detailed specifications',
    '- You\'re modifying an existing drawing (not creating from scratch)',
    '',
    '### Phase 1: Foundation',
    '1. Set up canvas (viewBox dimensions appropriate for the subject)',
    '2. Define shared resources using manage_defs (gradients, patterns, filters)',
    '3. Draw background layers',
    '4. preview_as_png → Confirm foundation looks correct',
    '',
    '### Phase 2: Construction',
    'Build the scene layer by layer, back to front:',
    '1. Distant elements (sky, mountains, horizon)',
    '2. Midground elements (hills, water, buildings)',
    '3. Foreground subjects (characters, trees, main objects)',
    '4. Every 3-4 operations → preview_as_png to catch issues early',
    '',
    'Important: As you build, **identify areas that will need fine detail** —',
    'faces, hands, hair, textures, intricate patterns. Use placeholder shapes',
    'for now and mark them mentally for Phase 3.',
    '',
    '### Phase 3: Detail & Polish',
    '> Complex details deserve focused, specialized attention.',
    '',
    'For areas needing fine detail, **dispatch the detail-painter sub-agent**:',
    '- Describe what to draw, the style, colors, and desired canvas size',
    '- detail-painter works on an isolated scratch canvas with full focus',
    '- Review the result with scratch_preview, then merge into your composition',
    '  using merge_scratch_canvas with appropriate positioning',
    '',
    'When to dispatch detail-painter:',
    '- Eyes, eyebrows, eyelashes, facial expressions',
    '- Mouths, teeth, lips — any facial features',
    '- Hands and fingers',
    '- Hair sections needing individual strand detail',
    '- Fabric folds, texture patterns, material details',
    '- Jewelry, accessories with intricate detail',
    '- Any element where precision and layered detail matter',
    '',
    'After merging details:',
    '- Apply filters and effects (apply_filter for shadows, glows, textures)',
    '- Add atmospheric effects (fog, vignette, lighting)',
    '- preview_as_png → Full visual review',
    '',
    '### Phase 4: Critique & Evolve',
    '> Great artists are their own harshest critics. Don\'t skip this phase.',
    '',
    '**Step 1: Self-critique (7 dimensions)**',
    'preview_as_png and evaluate:',
    '1. Purpose — Does it communicate the intended message?',
    '2. Hierarchy — Is the focal point dominant?',
    '3. Unity — Do all elements belong together?',
    '4. Variety — Enough visual interest without chaos?',
    '5. Proportion — Size relationships intentional?',
    '6. Rhythm — Does the eye flow naturally?',
    '7. Emphasis — Is there one clear star of the show?',
    '',
    '**Step 2: Self-improvement analysis**',
    'After your first complete version, **dispatch the bootstrap-reviewer agent**:',
    '- It analyzes your canvas, layers, defs, and color usage',
    '- It identifies capability gaps: missing filters, repetitive patterns,',
    '  custom tools or macros that would improve your workflow',
    '- It proposes specific, ready-to-use bootstrap improvements',
    '',
    'When to dispatch bootstrap-reviewer:',
    '- After completing the first full version of any non-trivial drawing',
    '- When you notice you\'re repeating the same multi-step sequence',
    '- When the existing filters/styles don\'t capture the effect you need',
    '',
    '**Step 3: Iterate**',
    'Based on your self-critique and bootstrap-reviewer feedback:',
    '- Fix composition/color/detail issues (return to Phase 2 or 3)',
    '- Implement suggested bootstrap improvements (write_filter, write_macro, etc.)',
    '- reload_session if bootstrap changes were made',
    '- Final preview_as_png → Confirm the artwork is *great*, not just okay',
    '',
    '### Scratch Canvas Tools (for main agent)',
    '- create_scratch_canvas — Create temp canvas (also available to detail-painter)',
    '- merge_scratch_canvas — Merge completed scratch into main drawing (main agent only)',
    '- list_scratch_canvases — Check for orphaned scratch canvases',
```

This replaces both the old "How You Work" section (lines 83-112) and the "Detail Sub-Agent" section (lines 148-172), merging them into a single coherent workflow.

**Step 2: Verify the change compiles**

Run: `npx tsx --eval "import('./server/pty-manager.js')" 2>&1 | head -5`
Expected: No syntax errors (may have runtime import errors, that's fine)

**Step 3: Commit**

```bash
git add server/pty-manager.ts
git commit -m "Rewrite system prompt with 5-phase professional workflow

Embeds design-advisor (Phase 0), detail-painter (Phase 3), and
bootstrap-reviewer (Phase 4) as core workflow steps rather than
optional slash commands. Adds quick-path for simple requests."
```

---

### Task 2: Update layer-workflow skill to match new phases

**Files:**
- Modify: `plugins/svg-drawing/skills/layer-workflow/SKILL.md:100-134` (the "Work Order" → "Recommended Workflow" section)

**Step 1: Replace the "Recommended Workflow" subsection**

Replace the current 5-phase workflow (lines 109-134) with an updated version that references the agents:

```markdown
### Recommended Workflow

```
Phase 0: Research & Design (for non-trivial drawings)
  → Dispatch design-advisor agent for visual reference research
  → Select from 2-3 proposed approaches
  → Lock in palette, composition strategy, and layer plan

Phase 1: Foundation
  1. Set up the canvas (viewBox dimensions)
  2. Define shared resources (gradients, patterns) using manage_defs
  3. Draw the background (sky, base color)
  4. preview_as_png → Confirm foundation

Phase 2: Construction (build back to front)
  4. Add distant elements (mountains, horizon)
  5. Add midground elements (hills, water)
  6. Add ground/terrain
  7. Add main subjects (buildings, trees, characters)
  8. Add shadows for subjects
  9. Add secondary subjects
  Mark areas needing fine detail for Phase 3

Phase 3: Detail & Polish
  → Dispatch detail-painter agent for fine details (faces, hands, hair, textures)
  → Review scratch canvas results, merge into main drawing
  10. Apply filters and effects
  11. Add atmospheric effects (fog, vignette)
  12. preview_as_png → Full visual review

Phase 4: Critique & Evolve
  13. preview_as_png → 7-dimension self-critique
  → Dispatch bootstrap-reviewer agent for self-improvement analysis
  14. Fix issues, implement improvements
  15. Final preview → Confirm artwork is great
```
```

**Step 2: Commit**

```bash
git add plugins/svg-drawing/skills/layer-workflow/SKILL.md
git commit -m "Sync layer-workflow skill with 5-phase professional workflow

Adds Phase 0 (design-advisor research), detail-painter dispatch in
Phase 3, and bootstrap-reviewer dispatch in Phase 4."
```

---

### Task 3: Run integration tests to verify no regressions

**Step 1: Run the integration test suite**

Run: `npm run test 2>&1 | tail -30`
Expected: All integration tests pass (these use DISABLE_PTY=1 so they don't actually spawn Claude CLI, but they test the server routes and WebSocket behavior)

**Step 2: Verify the system prompt is syntactically valid by checking server startup**

Run: `timeout 5 npx tsx server/index.ts 2>&1 || true`
Expected: Server starts without errors (will timeout after 5s, that's expected)

**Step 3: Commit test verification (no commit needed — this is verification only)**

If tests fail, investigate and fix before proceeding.

---

### Task 4: Manual smoke test — verify prompt content

**Step 1: Print the system prompt to verify formatting**

Create a quick verification script:

```bash
npx tsx -e "
import { PtyManager } from './server/pty-manager.js';
// Access the private buildDynamicPrompt to verify it works
const mgr = new PtyManager();
const prompt = await (mgr as any).buildDynamicPrompt();
console.log('=== Dynamic prompt length:', prompt.length);
console.log(prompt.substring(0, 200));
"
```

Expected: Dynamic prompt prints without errors, shows layer conventions at the start.

**Step 2: Verify system prompt includes all 5 phases**

Grep the pty-manager.ts to confirm all phases are present:

```bash
grep -n "Phase [0-4]" server/pty-manager.ts
```

Expected output should show 5 lines, one for each phase (0 through 4).
