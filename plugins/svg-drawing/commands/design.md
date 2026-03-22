---
description: "Explore visual design approaches with reference image research before drawing"
---

Use the design-advisor agent to research and analyze the user's drawing request.
The agent will automatically:
1. Search the web for visual references
2. Download and compress reference images locally
3. Analyze the references visually
4. Generate 2-3 design approaches informed by real references

Pass the user's full description AND the current drawId to the agent.
Present the results including:
- Downloaded reference images and their analysis
- Multiple distinct visual approaches grounded in research
- Color palettes for each approach
- Suggested layer structures
- Key SVG techniques to employ

After presenting, ask the user which approach they prefer (or if they
want to combine elements from multiple approaches).
