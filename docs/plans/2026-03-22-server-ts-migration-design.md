# Server JavaScript to TypeScript Migration Design

## Goal

Migrate all 5 server files from JavaScript to TypeScript for type safety, better IDE support, and consistency with the frontend codebase.

## Decisions

- **Runtime:** tsx (TypeScript Execute) for both dev and production — no build step needed
- **MCP server:** Also migrated to TypeScript, run via `npx tsx`
- **TypeScript config:** Separate `tsconfig.server.json` for server (no DOM types)

## Files to Migrate

| Current | Target |
|---------|--------|
| `server/index.js` | `server/index.ts` |
| `server/session-manager.js` | `server/session-manager.ts` |
| `server/pty-manager.js` | `server/pty-manager.ts` |
| `server/drawing-store.js` | `server/drawing-store.ts` |
| `server/mcp-server.js` | `server/mcp-server.ts` |

Total: ~763 lines across 5 files.

## TypeScript Configuration

New `tsconfig.server.json`:
- `target`: ES2022
- `module`: NodeNext
- `moduleResolution`: NodeNext
- `lib`: ES2022 only (no DOM)
- `strict`: true
- `noEmit`: true (tsx runs directly, no compilation output)
- `include`: `server/**/*.ts`
- `types`: `["node"]`

Root `tsconfig.json` unchanged — continues to cover `src/` frontend only.

## Dependencies

New devDependencies:
- `tsx` — TypeScript execution without build step
- `@types/node` — Node.js API types
- `@types/express` — Express framework types
- `@types/ws` — WebSocket types
- `@types/node-pty` — if not bundled with node-pty

## NPM Scripts

```json
{
  "dev": "concurrently \"vite\" \"tsx server/index.ts\"",
  "dev:server": "tsx server/index.ts",
  "start": "npm run build && tsx server/index.ts",
  "typecheck": "tsc --noEmit && tsc --noEmit -p tsconfig.server.json"
}
```

## MCP Config

`mcp-config.json` updated to use tsx:
```json
{
  "mcpServers": {
    "svg-artist": {
      "command": "npx",
      "args": ["tsx", "./server/mcp-server.ts"]
    }
  }
}
```

## Playwright Test Config

`playwright.config.ts` webServer command updated to use `tsx server/index.ts` instead of `node server/index.js`.

## Type Design

Key interfaces to define:
- `Drawing` — drawing data shape (id, name, svgContent, sessionId, createdAt)
- `SelectionData` — region selection info sent via WebSocket
- Extended WebSocket types with `drawId` property attached to requests

## Migration Approach

Each file is renamed `.js` → `.ts` and enhanced with:
- Parameter and return type annotations on all functions/methods
- Interface definitions for data structures
- Removal of JSDoc type comments in favor of native TypeScript types
- Proper typing for Express request/response, WebSocket events, and PTY lifecycle
