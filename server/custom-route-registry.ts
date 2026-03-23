import type { Request, Response } from 'express';
import { loadAllCustomRoutes, loadAllCustomTools, loadAllCustomMacros } from './bootstrap-store.js';
import { executePipeline, registerMacroAction, clearMacroActions } from './pipeline-engine.js';
import type { PipelineContext, PipelineDeps, PipelineStep } from './pipeline-engine.js';

type RouteHandler = (req: Request, res: Response) => Promise<void>;

function createPipelineHandler(steps: PipelineStep[], deps: PipelineDeps): RouteHandler {
  return async (req: Request, res: Response) => {
    const drawId = req.params.drawId as string;
    const ctx: PipelineContext = {
      drawId,
      vars: {},
      prev: undefined,
      input: req.body as Record<string, unknown>,
    };
    try {
      const result = await executePipeline(steps, ctx, deps);
      res.json({ ok: true, result });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  };
}

class CustomRouteRegistry {
  private routes: Map<string, RouteHandler> = new Map();
  private tools: Map<string, RouteHandler> = new Map();

  getRouteHandler(name: string): RouteHandler | undefined {
    return this.routes.get(name);
  }

  getToolHandler(name: string): RouteHandler | undefined {
    return this.tools.get(name);
  }

  /**
   * Reload all custom routes, tools, and macros from disk.
   * Clears existing handlers and re-registers from bootstrap store.
   */
  async reloadAll(deps: PipelineDeps): Promise<void> {
    this.routes.clear();
    this.tools.clear();

    // Reload macros first (they register as actions that routes/tools can use)
    clearMacroActions();
    const macros = await loadAllCustomMacros();
    for (const macro of macros) {
      registerMacroAction(macro.name, macro.macro.steps as PipelineStep[]);
    }

    // Reload custom routes
    const routes = await loadAllCustomRoutes();
    for (const route of routes) {
      this.routes.set(route.name, createPipelineHandler(route.handler.steps as PipelineStep[], deps));
    }

    // Reload custom tools
    const tools = await loadAllCustomTools();
    for (const tool of tools) {
      this.tools.set(tool.name, createPipelineHandler(tool.handler.steps as PipelineStep[], deps));
    }
  }
}

export const routeRegistry = new CustomRouteRegistry();
