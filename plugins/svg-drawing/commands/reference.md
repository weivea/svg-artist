---
description: "Search for visual references to guide your drawing (now powered by design-advisor)"
---

Use the design-advisor agent to find and download visual references for the subject described. Pass the user's description AND the current drawId to the agent.

The design-advisor now handles the full reference research workflow:
1. Web search for relevant reference images
2. Download and compress images to data/references/<drawId>/
3. Visual analysis of each reference image
4. Summary of color trends, composition patterns, and style characteristics

Relay the results back, including:
- Downloaded reference image paths and descriptions
- Visual analysis of reference images
- Suggested color palette based on research
- Recommended layer structure
- SVG implementation suggestions
