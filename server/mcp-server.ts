import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const CALLBACK_URL = process.env.SVG_CALLBACK_URL || 'http://localhost:3000/api/svg';

const server = new McpServer({
  name: 'svg-artist',
  version: '1.0.0',
});

server.tool(
  'draw_svg',
  'Draw or update the SVG artwork. Pass the complete SVG content including the <svg> root element.',
  {
    svg_content: z.string().describe('Complete SVG markup to render'),
  },
  async ({ svg_content }: { svg_content: string }) => {
    try {
      const res = await fetch(CALLBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ svg: svg_content }),
      });

      if (!res.ok) {
        return {
          content: [{ type: 'text' as const, text: `Failed to push SVG update: HTTP ${res.status}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text' as const, text: 'SVG rendered successfully in the preview pane.' }],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: 'text' as const, text: `Failed to push SVG update: ${message}` }],
        isError: true,
      };
    }
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
