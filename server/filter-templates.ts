import { loadCustomFilter } from './bootstrap-store.js';

export type FilterType =
  | 'drop-shadow'
  | 'blur'
  | 'glow'
  | 'emboss'
  | 'noise-texture'
  | 'paper'
  | 'watercolor'
  | 'metallic'
  | 'glass';

export interface FilterParams {
  [key: string]: number | string | undefined;
}

export interface FilterResult {
  filterId: string;
  filterSvg: string;
}

export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

function param<T extends number | string>(
  params: FilterParams | undefined,
  key: string,
  defaultVal: T,
): T {
  if (!params || params[key] === undefined) return defaultVal;
  const val = params[key];
  if (typeof defaultVal === 'number') return Number(val) as T;
  return String(val) as T;
}

function buildDropShadow(id: string, params?: FilterParams): string {
  const dx = param(params, 'dx', 4);
  const dy = param(params, 'dy', 4);
  const blur = param(params, 'blur', 6);
  const color = param(params, 'color', '#000000');
  const opacity = param(params, 'opacity', 0.5);

  return `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="blur"/>
  <feOffset in="blur" dx="${dx}" dy="${dy}" result="offsetBlur"/>
  <feFlood flood-color="${color}" flood-opacity="${opacity}" result="color"/>
  <feComposite in="color" in2="offsetBlur" operator="in" result="shadow"/>
  <feMerge>
    <feMergeNode in="shadow"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>`;
}

function buildBlur(id: string, params?: FilterParams): string {
  const radius = param(params, 'radius', 5);

  return `<filter id="${id}">
  <feGaussianBlur in="SourceGraphic" stdDeviation="${radius}"/>
</filter>`;
}

function buildGlow(id: string, params?: FilterParams): string {
  const radius = param(params, 'radius', 10);
  const color = param(params, 'color', '#ffffff');
  const opacity = param(params, 'opacity', 0.8);

  return `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%">
  <feFlood flood-color="${color}" flood-opacity="${opacity}" result="color"/>
  <feComposite in="color" in2="SourceAlpha" operator="in" result="colored"/>
  <feGaussianBlur in="colored" stdDeviation="${radius}" result="glow"/>
  <feMerge>
    <feMergeNode in="glow"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>`;
}

function buildEmboss(id: string, params?: FilterParams): string {
  const strength = param(params, 'strength', 2);

  return `<filter id="${id}">
  <feGaussianBlur in="SourceAlpha" stdDeviation="${strength}" result="blur"/>
  <feDiffuseLighting in="blur" surfaceScale="${strength}" diffuseConstant="1" result="light">
    <feDistantLight azimuth="225" elevation="45"/>
  </feDiffuseLighting>
  <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
</filter>`;
}

function buildNoiseTexture(id: string, params?: FilterParams): string {
  const frequency = param(params, 'frequency', 0.65);
  const octaves = param(params, 'octaves', 3);
  const type = param(params, 'type', 'fractalNoise');

  return `<filter id="${id}">
  <feTurbulence type="${type}" baseFrequency="${frequency}" numOctaves="${octaves}" result="noise"/>
  <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
</filter>`;
}

function buildPaper(id: string, params?: FilterParams): string {
  const frequency = param(params, 'frequency', 0.04);
  const intensity = param(params, 'intensity', 0.15);

  return `<filter id="${id}">
  <feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="5" result="paper"/>
  <feColorMatrix in="paper" type="saturate" values="0" result="gray"/>
  <feBlend in="SourceGraphic" in2="gray" mode="multiply" result="textured"/>
  <feComponentTransfer in="textured">
    <feFuncA type="linear" slope="1" intercept="${intensity}"/>
  </feComponentTransfer>
</filter>`;
}

function buildWatercolor(id: string, params?: FilterParams): string {
  const displacement = param(params, 'displacement', 20);
  const blur = param(params, 'blur', 3);

  return `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="3" seed="1" result="turbulence"/>
  <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="${displacement}" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
  <feGaussianBlur in="displaced" stdDeviation="${blur}"/>
</filter>`;
}

function buildMetallic(id: string, params?: FilterParams): string {
  const shininess = param(params, 'shininess', 30);
  const lightX = param(params, 'light_x', 200);
  const lightY = param(params, 'light_y', 100);

  return `<filter id="${id}">
  <feSpecularLighting in="SourceAlpha" specularExponent="${shininess}" specularConstant="1" surfaceScale="5" result="specular">
    <fePointLight x="${lightX}" y="${lightY}" z="200"/>
  </feSpecularLighting>
  <feComposite in="specular" in2="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
</filter>`;
}

function buildGlass(id: string, params?: FilterParams): string {
  const shininess = param(params, 'shininess', 50);
  const opacity = param(params, 'opacity', 0.3);

  return `<filter id="${id}">
  <feSpecularLighting in="SourceAlpha" specularExponent="${shininess}" specularConstant="0.8" surfaceScale="3" result="specular">
    <fePointLight x="150" y="50" z="300"/>
  </feSpecularLighting>
  <feComposite in="specular" in2="SourceAlpha" operator="in" result="specClip"/>
  <feComponentTransfer in="specClip" result="dimmed">
    <feFuncA type="linear" slope="${opacity}"/>
  </feComponentTransfer>
  <feBlend in="SourceGraphic" in2="dimmed" mode="screen"/>
</filter>`;
}

const builders: Record<FilterType, (id: string, params?: FilterParams) => string> = {
  'drop-shadow': buildDropShadow,
  'blur': buildBlur,
  'glow': buildGlow,
  'emboss': buildEmboss,
  'noise-texture': buildNoiseTexture,
  'paper': buildPaper,
  'watercolor': buildWatercolor,
  'metallic': buildMetallic,
  'glass': buildGlass,
};

export function generateFilter(
  filterType: FilterType,
  params?: FilterParams,
  suffix?: string,
): FilterResult {
  const sfx = suffix ?? randomSuffix();
  const filterId = `filter-${filterType}-${sfx}`;
  const builder = builders[filterType];
  const filterSvg = builder(filterId, params);

  return { filterId, filterSvg };
}

// Render a custom filter template by replacing {{param:default}} placeholders
function renderTemplate(template: string, id: string, params?: FilterParams): string {
  let result = template.replace(/\{\{id\}\}/g, id);
  result = result.replace(/\{\{(\w+):([^}]*)\}\}/g, (_match: string, name: string, defaultVal: string) => {
    if (params && params[name] !== undefined) {
      return String(params[name]);
    }
    return defaultVal;
  });
  return result;
}

export function extractFilterPrimitives(filterSvg: string): string {
  const match = filterSvg.match(/<filter[^>]*>([\s\S]*)<\/filter>/);
  return match ? match[1].trim() : '';
}

export async function generateFilterOrCustom(
  filterType: string,
  params?: FilterParams,
  suffix?: string,
): Promise<FilterResult | null> {
  // 1. Try built-in first
  if (filterType in builders) {
    return generateFilter(filterType as FilterType, params, suffix);
  }
  // 2. Try custom filter from bootstrap store
  const custom = await loadCustomFilter(filterType);
  if (!custom) return null;
  const sfx = suffix ?? randomSuffix();
  const filterId = `filter-${filterType}-${sfx}`;
  const filterSvg = renderTemplate(custom.svg_template, filterId, params);
  return { filterId, filterSvg };
}
