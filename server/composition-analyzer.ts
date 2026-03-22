import { SvgEngine, BBox } from './svg-engine.js';

export interface DimensionScore {
  score: number;
  notes: string;
}

export interface CompositionIssue {
  category: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}

export interface CompositionAnalysis {
  score: number;
  dimensions: {
    purpose: DimensionScore;
    hierarchy: DimensionScore;
    unity: DimensionScore;
    variety: DimensionScore;
    proportion: DimensionScore;
    rhythm: DimensionScore;
    emphasis: DimensionScore;
  };
  issues: CompositionIssue[];
  strengths: string[];
}

// --- Color Utilities ---

function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#([0-9a-fA-F]{3,8})$/);
  if (!match) return null;
  let r: number, g: number, b: number;
  const val = match[1];
  if (val.length === 3) {
    r = parseInt(val[0] + val[0], 16);
    g = parseInt(val[1] + val[1], 16);
    b = parseInt(val[2] + val[2], 16);
  } else if (val.length >= 6) {
    r = parseInt(val.slice(0, 2), 16);
    g = parseInt(val.slice(2, 4), 16);
    b = parseInt(val.slice(4, 6), 16);
  } else {
    return null;
  }
  return { r, g, b };
}

function rgbToHue(r: number, g: number, b: number): number {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  if (delta === 0) return 0;
  let hue: number;
  if (max === rn) hue = ((gn - bn) / delta) % 6;
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  return hue;
}

function extractColorsFromContent(content: string): string[] {
  const colorRegex = /#[0-9a-fA-F]{3,8}\b/g;
  const matches = content.match(colorRegex) || [];
  // Also extract named SVG colors from fill/stroke attributes
  const attrRegex = /(?:fill|stroke)\s*=\s*"([^"]+)"/g;
  let attrMatch: RegExpExecArray | null;
  const colors = new Set<string>(matches);
  while ((attrMatch = attrRegex.exec(content)) !== null) {
    const val = attrMatch[1].trim();
    if (val.startsWith('#')) {
      colors.add(val);
    }
  }
  return Array.from(colors);
}

// --- Analysis Helpers ---

function analyzePurpose(
  engine: SvgEngine,
): { score: DimensionScore; issues: CompositionIssue[]; strengths: string[] } {
  const issues: CompositionIssue[] = [];
  const strengths: string[] = [];
  const info = engine.getCanvasInfo();
  const layers = engine.listLayers();

  if (info.totalElements === 0 || layers.length === 0) {
    return {
      score: { score: 0, notes: 'SVG is empty with no meaningful content.' },
      issues: [{
        category: 'purpose',
        severity: 'high',
        description: 'The SVG contains no layers or elements.',
        suggestion: 'Add content layers with descriptive names to give the composition meaning.',
      }],
      strengths,
    };
  }

  let score = 40; // base for having content

  // Check layer naming quality
  const namedLayers = layers.filter((l) => l.name && !l.name.startsWith('layer-'));
  const namingRatio = namedLayers.length / layers.length;
  if (namingRatio >= 0.8) {
    score += 30;
    strengths.push('Layers are well-named with descriptive data-name attributes.');
  } else if (namingRatio >= 0.5) {
    score += 15;
    issues.push({
      category: 'purpose',
      severity: 'low',
      description: `Only ${Math.round(namingRatio * 100)}% of layers have descriptive names.`,
      suggestion: 'Give all layers meaningful data-name attributes for clarity.',
    });
  } else {
    issues.push({
      category: 'purpose',
      severity: 'medium',
      description: 'Most layers lack descriptive names.',
      suggestion: 'Name layers to describe their role (e.g., "background", "main-subject", "details").',
    });
  }

  // Bonus for having multiple layers (structured composition)
  if (layers.length >= 3) {
    score += 20;
    strengths.push(`Well-structured with ${layers.length} distinct layers.`);
  } else if (layers.length >= 2) {
    score += 10;
  }

  // Bonus for having defs (shows sophistication)
  if (info.defsCount > 0) {
    score += 10;
    strengths.push('Uses defs (gradients/filters/patterns) for visual richness.');
  }

  return {
    score: { score: Math.min(score, 100), notes: `SVG has ${layers.length} layers and ${info.totalElements} total elements.` },
    issues,
    strengths,
  };
}

function analyzeHierarchy(
  engine: SvgEngine,
  bboxes: Map<string, BBox>,
): { score: DimensionScore; issues: CompositionIssue[]; strengths: string[] } {
  const issues: CompositionIssue[] = [];
  const strengths: string[] = [];

  if (bboxes.size === 0) {
    return {
      score: { score: 30, notes: 'No measurable elements to assess hierarchy.' },
      issues: [{
        category: 'hierarchy',
        severity: 'medium',
        description: 'Could not measure element sizes for hierarchy analysis.',
        suggestion: 'Ensure elements use standard SVG shapes with explicit geometry attributes.',
      }],
      strengths,
    };
  }

  const areas = Array.from(bboxes.values()).map((b) => b.width * b.height).filter((a) => a > 0);

  if (areas.length <= 1) {
    return {
      score: { score: 40, notes: 'Only one measurable element; hierarchy requires multiple elements.' },
      issues: [{
        category: 'hierarchy',
        severity: 'medium',
        description: 'Single element composition lacks visual hierarchy.',
        suggestion: 'Add supporting elements at different scales to create depth and hierarchy.',
      }],
      strengths,
    };
  }

  areas.sort((a, b) => b - a);
  const largest = areas[0];
  const secondLargest = areas[1];
  const smallest = areas[areas.length - 1];

  let score = 40;
  const dominanceRatio = largest / secondLargest;

  // Good hierarchy: dominant element is significantly larger
  if (dominanceRatio >= 2) {
    score += 30;
    strengths.push('Clear dominant element establishes strong visual hierarchy.');
  } else if (dominanceRatio >= 1.3) {
    score += 15;
  } else {
    issues.push({
      category: 'hierarchy',
      severity: 'medium',
      description: 'Elements are similar in size, creating weak hierarchy.',
      suggestion: 'Make the focal element 2-3x larger than supporting elements to strengthen hierarchy.',
    });
  }

  // Size variation adds depth
  const sizeRange = largest / smallest;
  if (sizeRange >= 5) {
    score += 20;
    strengths.push('Good range of element sizes creates visual depth.');
  } else if (sizeRange >= 2) {
    score += 10;
  } else {
    issues.push({
      category: 'hierarchy',
      severity: 'low',
      description: 'Limited size variation between elements.',
      suggestion: 'Introduce elements at different scales (large, medium, small) for visual interest.',
    });
  }

  return {
    score: { score: Math.min(score, 100), notes: `${areas.length} elements measured; dominance ratio ${dominanceRatio.toFixed(1)}x.` },
    issues,
    strengths,
  };
}

function analyzeUnity(
  engine: SvgEngine,
): { score: DimensionScore; issues: CompositionIssue[]; strengths: string[] } {
  const issues: CompositionIssue[] = [];
  const strengths: string[] = [];

  const source = engine.getSource();
  const colors = extractColorsFromContent(source);

  if (colors.length === 0) {
    return {
      score: { score: 50, notes: 'No explicit colors found to analyze.' },
      issues: [{
        category: 'unity',
        severity: 'low',
        description: 'No color attributes found for cohesion analysis.',
        suggestion: 'Define explicit fill and stroke colors for a cohesive palette.',
      }],
      strengths,
    };
  }

  // Extract hues from colors
  const hues: number[] = [];
  for (const color of colors) {
    const rgb = parseHexColor(color);
    if (rgb) {
      hues.push(rgbToHue(rgb.r, rgb.g, rgb.b));
    }
  }

  if (hues.length === 0) {
    return {
      score: { score: 50, notes: 'Could not parse colors for hue analysis.' },
      issues,
      strengths,
    };
  }

  let score = 40;

  // Check hue clustering: how concentrated are the hues?
  // Group hues into 30-degree buckets
  const buckets = new Array<number>(12).fill(0);
  for (const hue of hues) {
    const bucket = Math.floor(hue / 30) % 12;
    buckets[bucket]++;
  }

  const usedBuckets = buckets.filter((b) => b > 0).length;
  const uniqueColors = new Set(colors).size;

  if (usedBuckets <= 3 && uniqueColors >= 2) {
    score += 40;
    strengths.push(`Cohesive color palette using ${uniqueColors} colors within ${usedBuckets} hue families.`);
  } else if (usedBuckets <= 5) {
    score += 20;
  } else {
    issues.push({
      category: 'unity',
      severity: 'medium',
      description: `Colors span ${usedBuckets} different hue families, reducing cohesion.`,
      suggestion: 'Limit your palette to 2-3 hue families for a more unified look.',
    });
  }

  // Small bonus for reasonable palette size
  if (uniqueColors >= 3 && uniqueColors <= 7) {
    score += 10;
  } else if (uniqueColors > 10) {
    issues.push({
      category: 'unity',
      severity: 'low',
      description: `Large color palette (${uniqueColors} colors) may reduce visual unity.`,
      suggestion: 'Consolidate similar colors to streamline the palette.',
    });
  }

  return {
    score: { score: Math.min(score, 100), notes: `Found ${uniqueColors} unique colors across ${usedBuckets} hue families.` },
    issues,
    strengths,
  };
}

function analyzeVariety(
  engine: SvgEngine,
  bboxes: Map<string, BBox>,
): { score: DimensionScore; issues: CompositionIssue[]; strengths: string[] } {
  const issues: CompositionIssue[] = [];
  const strengths: string[] = [];

  const source = engine.getSource();

  // Check for different element types
  const shapeTypes = new Set<string>();
  const shapeRegex = /<(circle|rect|ellipse|polygon|polyline|line|path|text)\b/g;
  let match: RegExpExecArray | null;
  while ((match = shapeRegex.exec(source)) !== null) {
    shapeTypes.add(match[1]);
  }

  let score = 30;

  if (shapeTypes.size >= 4) {
    score += 35;
    strengths.push(`Rich variety of ${shapeTypes.size} different shape types.`);
  } else if (shapeTypes.size >= 2) {
    score += 20;
  } else if (shapeTypes.size === 1) {
    issues.push({
      category: 'variety',
      severity: 'medium',
      description: `Only one shape type (${Array.from(shapeTypes)[0]}) used throughout.`,
      suggestion: 'Mix different shapes (circles, rectangles, paths) for more visual interest.',
    });
  } else {
    issues.push({
      category: 'variety',
      severity: 'high',
      description: 'No recognizable shape elements found.',
      suggestion: 'Add standard SVG shape elements to build the composition.',
    });
  }

  // Check size variety among elements
  if (bboxes.size >= 2) {
    const areas = Array.from(bboxes.values())
      .map((b) => b.width * b.height)
      .filter((a) => a > 0);

    if (areas.length >= 2) {
      areas.sort((a, b) => a - b);
      const sizeRatio = areas[areas.length - 1] / areas[0];
      if (sizeRatio >= 4) {
        score += 25;
        strengths.push('Good size variety among elements.');
      } else if (sizeRatio >= 2) {
        score += 15;
      } else {
        issues.push({
          category: 'variety',
          severity: 'low',
          description: 'Elements are all similar sizes.',
          suggestion: 'Vary element sizes to create visual interest and rhythm.',
        });
      }
    }
  }

  return {
    score: { score: Math.min(score, 100), notes: `${shapeTypes.size} shape types, ${bboxes.size} positioned elements.` },
    issues,
    strengths,
  };
}

function analyzeProportion(
  engine: SvgEngine,
  bboxes: Map<string, BBox>,
): { score: DimensionScore; issues: CompositionIssue[]; strengths: string[] } {
  const issues: CompositionIssue[] = [];
  const strengths: string[] = [];
  const info = engine.getCanvasInfo();

  // Parse viewBox for canvas dimensions
  const vbParts = info.viewBox.split(/\s+/).map(Number);
  const canvasWidth = vbParts[2] || 800;
  const canvasHeight = vbParts[3] || 800;
  const canvasArea = canvasWidth * canvasHeight;

  if (bboxes.size === 0) {
    return {
      score: { score: 40, notes: 'No measurable elements for proportion analysis.' },
      issues,
      strengths,
    };
  }

  let score = 35;

  // Check canvas fill ratio (total element area vs canvas area)
  const totalArea = Array.from(bboxes.values())
    .reduce((sum, b) => sum + b.width * b.height, 0);
  const fillRatio = totalArea / canvasArea;

  if (fillRatio >= 0.2 && fillRatio <= 0.8) {
    score += 30;
    strengths.push(`Good canvas utilization (${Math.round(fillRatio * 100)}% fill).`);
  } else if (fillRatio < 0.2) {
    score += 10;
    issues.push({
      category: 'proportion',
      severity: 'medium',
      description: `Elements only fill ${Math.round(fillRatio * 100)}% of the canvas.`,
      suggestion: 'Scale up elements or add more content to better utilize the canvas space.',
    });
  } else {
    score += 10;
    issues.push({
      category: 'proportion',
      severity: 'low',
      description: `Elements are very dense (${Math.round(fillRatio * 100)}% fill), canvas may feel crowded.`,
      suggestion: 'Add breathing room between elements or increase canvas size.',
    });
  }

  // Check aspect ratio relationships
  const aspectRatios = Array.from(bboxes.values())
    .filter((b) => b.width > 0 && b.height > 0)
    .map((b) => b.width / b.height);

  if (aspectRatios.length >= 2) {
    const hasVariedRatios = new Set(aspectRatios.map((r) => Math.round(r * 10) / 10)).size > 1;
    if (hasVariedRatios) {
      score += 20;
      strengths.push('Elements use varied aspect ratios, adding visual interest.');
    } else {
      score += 5;
      issues.push({
        category: 'proportion',
        severity: 'low',
        description: 'All elements share similar aspect ratios.',
        suggestion: 'Mix tall/narrow and wide/short elements for better proportion variety.',
      });
    }
  }

  return {
    score: { score: Math.min(score, 100), notes: `Canvas fill ratio: ${Math.round(fillRatio * 100)}%, ${aspectRatios.length} elements measured.` },
    issues,
    strengths,
  };
}

function analyzeRhythm(
  bboxes: Map<string, BBox>,
): { score: DimensionScore; issues: CompositionIssue[]; strengths: string[] } {
  const issues: CompositionIssue[] = [];
  const strengths: string[] = [];

  if (bboxes.size < 3) {
    return {
      score: { score: 40, notes: 'Need at least 3 elements to analyze rhythm.' },
      issues: bboxes.size < 3 ? [{
        category: 'rhythm',
        severity: 'low',
        description: 'Too few elements to establish visual rhythm.',
        suggestion: 'Add more elements to create patterns and rhythm in the composition.',
      }] : [],
      strengths,
    };
  }

  // Sort elements by x position to analyze horizontal spacing
  const sorted = Array.from(bboxes.values())
    .sort((a, b) => a.x - b.x);

  // Calculate center-to-center distances
  const distances: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const cx1 = sorted[i - 1].x + sorted[i - 1].width / 2;
    const cy1 = sorted[i - 1].y + sorted[i - 1].height / 2;
    const cx2 = sorted[i].x + sorted[i].width / 2;
    const cy2 = sorted[i].y + sorted[i].height / 2;
    distances.push(Math.sqrt((cx2 - cx1) ** 2 + (cy2 - cy1) ** 2));
  }

  let score = 35;

  if (distances.length >= 2) {
    // Check spacing regularity (coefficient of variation)
    const mean = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + (d - mean) ** 2, 0) / distances.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 0;

    if (cv < 0.3) {
      score += 40;
      strengths.push('Elements are evenly spaced, creating a strong visual rhythm.');
    } else if (cv < 0.6) {
      score += 20;
      strengths.push('Elements show moderate spacing regularity.');
    } else {
      issues.push({
        category: 'rhythm',
        severity: 'low',
        description: 'Irregular element spacing breaks visual rhythm.',
        suggestion: 'Consider more consistent spacing between elements, or use deliberate grouping.',
      });
    }
  }

  return {
    score: { score: Math.min(score, 100), notes: `Analyzed spacing between ${sorted.length} elements.` },
    issues,
    strengths,
  };
}

function analyzeEmphasis(
  engine: SvgEngine,
  bboxes: Map<string, BBox>,
): { score: DimensionScore; issues: CompositionIssue[]; strengths: string[] } {
  const issues: CompositionIssue[] = [];
  const strengths: string[] = [];

  if (bboxes.size === 0) {
    return {
      score: { score: 30, notes: 'No elements to analyze for emphasis.' },
      issues: [{
        category: 'emphasis',
        severity: 'medium',
        description: 'No measurable elements for focal point analysis.',
        suggestion: 'Add a prominent element to serve as the focal point of the composition.',
      }],
      strengths,
    };
  }

  const info = engine.getCanvasInfo();
  const vbParts = info.viewBox.split(/\s+/).map(Number);
  const canvasWidth = vbParts[2] || 800;
  const canvasHeight = vbParts[3] || 800;

  const areas = Array.from(bboxes.entries()).map(([id, b]) => ({
    id,
    area: b.width * b.height,
    cx: b.x + b.width / 2,
    cy: b.y + b.height / 2,
  }));

  areas.sort((a, b) => b.area - a.area);

  let score = 30;

  if (areas.length === 1) {
    // Single element is the focal point by default
    score += 30;
    strengths.push('Single element serves as a clear focal point.');
  } else {
    const largest = areas[0];
    const secondLargest = areas[1];
    const ratio = largest.area / secondLargest.area;

    if (ratio >= 2.5) {
      score += 35;
      strengths.push('Clear focal point: dominant element is significantly larger than others.');
    } else if (ratio >= 1.5) {
      score += 20;
    } else {
      issues.push({
        category: 'emphasis',
        severity: 'medium',
        description: 'No clear focal point; elements compete for attention.',
        suggestion: 'Make your main subject 2-3x larger than supporting elements to create a focal point.',
      });
    }

    // Check if focal element is well-positioned (center or rule-of-thirds)
    const focalCx = largest.cx / canvasWidth;
    const focalCy = largest.cy / canvasHeight;

    const nearCenter = Math.abs(focalCx - 0.5) < 0.15 && Math.abs(focalCy - 0.5) < 0.15;
    const nearThirds =
      (Math.abs(focalCx - 1 / 3) < 0.1 || Math.abs(focalCx - 2 / 3) < 0.1) &&
      (Math.abs(focalCy - 1 / 3) < 0.1 || Math.abs(focalCy - 2 / 3) < 0.1);

    if (nearCenter || nearThirds) {
      score += 20;
      strengths.push(
        nearCenter
          ? 'Focal element is well-centered in the composition.'
          : 'Focal element follows the rule of thirds.',
      );
    } else {
      score += 5;
      issues.push({
        category: 'emphasis',
        severity: 'low',
        description: 'Focal element is not at a strong compositional position.',
        suggestion: 'Position the main subject at the center or along the rule-of-thirds grid lines.',
      });
    }
  }

  return {
    score: { score: Math.min(score, 100), notes: `${areas.length} elements analyzed for focal point.` },
    issues,
    strengths,
  };
}

// --- Main Export ---

export function analyzeComposition(engine: SvgEngine): CompositionAnalysis {
  const layers = engine.listLayers();

  // Collect bounding boxes for all layers
  const bboxes = new Map<string, BBox>();
  for (const layer of layers) {
    const bbox = engine.getElementBBox(layer.id);
    if (bbox && (bbox.width > 0 || bbox.height > 0)) {
      bboxes.set(layer.id, bbox);
    }
  }

  // Run all dimension analyses
  const purposeResult = analyzePurpose(engine);
  const hierarchyResult = analyzeHierarchy(engine, bboxes);
  const unityResult = analyzeUnity(engine);
  const varietyResult = analyzeVariety(engine, bboxes);
  const proportionResult = analyzeProportion(engine, bboxes);
  const rhythmResult = analyzeRhythm(bboxes);
  const emphasisResult = analyzeEmphasis(engine, bboxes);

  // Collect all issues and strengths
  const issues: CompositionIssue[] = [
    ...purposeResult.issues,
    ...hierarchyResult.issues,
    ...unityResult.issues,
    ...varietyResult.issues,
    ...proportionResult.issues,
    ...rhythmResult.issues,
    ...emphasisResult.issues,
  ];

  const strengths: string[] = [
    ...purposeResult.strengths,
    ...hierarchyResult.strengths,
    ...unityResult.strengths,
    ...varietyResult.strengths,
    ...proportionResult.strengths,
    ...rhythmResult.strengths,
    ...emphasisResult.strengths,
  ];

  const dimensions = {
    purpose: purposeResult.score,
    hierarchy: hierarchyResult.score,
    unity: unityResult.score,
    variety: varietyResult.score,
    proportion: proportionResult.score,
    rhythm: rhythmResult.score,
    emphasis: emphasisResult.score,
  };

  // Calculate weighted overall score
  const weights = {
    purpose: 0.15,
    hierarchy: 0.15,
    unity: 0.15,
    variety: 0.1,
    proportion: 0.15,
    rhythm: 0.1,
    emphasis: 0.2,
  };

  const overallScore = Math.round(
    dimensions.purpose.score * weights.purpose +
    dimensions.hierarchy.score * weights.hierarchy +
    dimensions.unity.score * weights.unity +
    dimensions.variety.score * weights.variety +
    dimensions.proportion.score * weights.proportion +
    dimensions.rhythm.score * weights.rhythm +
    dimensions.emphasis.score * weights.emphasis,
  );

  return {
    score: overallScore,
    dimensions,
    issues,
    strengths,
  };
}
