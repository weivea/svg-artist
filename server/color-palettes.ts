export interface Palette {
  name: string;
  description: string;
  colors: string[];
  usage: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export interface PaletteResult {
  palettes: Palette[];
}

// --- HSL Utilities ---

interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

function hslToHex(hsl: HSL): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (c: number): string => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

// --- Theme and Mood Mappings ---

interface ThemeConfig {
  baseHue: number;
  hueRange: number;       // hue spread for variation
  saturation: number;      // base saturation
  lightness: number;       // base lightness
}

const themeMappings: Record<string, ThemeConfig> = {
  ocean:  { baseHue: 200, hueRange: 30, saturation: 60, lightness: 50 },
  autumn: { baseHue: 25,  hueRange: 35, saturation: 55, lightness: 45 },
  sunset: { baseHue: 10,  hueRange: 50, saturation: 70, lightness: 50 },
  forest: { baseHue: 120, hueRange: 40, saturation: 45, lightness: 40 },
  urban:  { baseHue: 220, hueRange: 20, saturation: 15, lightness: 50 },
  spring: { baseHue: 90,  hueRange: 60, saturation: 55, lightness: 65 },
  night:  { baseHue: 250, hueRange: 30, saturation: 50, lightness: 25 },
  desert: { baseHue: 30,  hueRange: 25, saturation: 50, lightness: 55 },
};

interface MoodModifier {
  saturationMod: number;
  lightnessMod: number;
  hueShift: number;
}

const moodMappings: Record<string, MoodModifier> = {
  calm:       { saturationMod: -15, lightnessMod: 10,  hueShift: 0 },
  energetic:  { saturationMod: 20,  lightnessMod: 5,   hueShift: 0 },
  mysterious: { saturationMod: 5,   lightnessMod: -20, hueShift: 30 },
  warm:       { saturationMod: 10,  lightnessMod: 5,   hueShift: -10 },
  cold:       { saturationMod: 0,   lightnessMod: 5,   hueShift: 20 },
  playful:    { saturationMod: 25,  lightnessMod: 15,  hueShift: 15 },
  elegant:    { saturationMod: -10, lightnessMod: -5,  hueShift: 0 },
};

// --- Harmony Methods ---

type HarmonyMethod = 'complementary' | 'analogous' | 'triadic';

function generateHarmonyColors(base: HSL, method: HarmonyMethod): HSL[] {
  switch (method) {
    case 'complementary':
      return [
        base,
        { ...base, h: normalizeHue(base.h + 15), l: base.l + 10 },
        { ...base, h: normalizeHue(base.h + 180), s: base.s - 5 },
        { ...base, h: normalizeHue(base.h + 180), l: Math.min(base.l + 25, 92) },
        { ...base, h: normalizeHue(base.h + 195), l: Math.max(base.l - 20, 15) },
      ];
    case 'analogous':
      return [
        base,
        { ...base, h: normalizeHue(base.h + 30), l: base.l + 5 },
        { ...base, h: normalizeHue(base.h - 30), s: base.s + 5 },
        { ...base, h: normalizeHue(base.h + 15), l: Math.min(base.l + 30, 92) },
        { ...base, h: normalizeHue(base.h - 15), l: Math.max(base.l - 25, 15) },
      ];
    case 'triadic':
      return [
        base,
        { ...base, h: normalizeHue(base.h + 120), l: base.l + 5 },
        { ...base, h: normalizeHue(base.h + 240), s: base.s - 5 },
        { ...base, h: normalizeHue(base.h + 60), l: Math.min(base.l + 28, 92) },
        { ...base, h: normalizeHue(base.h + 180), l: Math.max(base.l - 22, 15) },
      ];
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function harmonyName(method: HarmonyMethod): string {
  switch (method) {
    case 'complementary': return 'Complementary';
    case 'analogous': return 'Analogous';
    case 'triadic': return 'Triadic';
  }
}

// --- Main Function ---

export function generatePalettes(options: {
  theme?: string;
  mood?: string;
  count?: number;
}): PaletteResult {
  const count = options.count ?? 3;

  // Resolve base HSL from theme (default to a neutral blue if no theme)
  const themeKey = options.theme?.toLowerCase() ?? '';
  const themeConfig = themeMappings[themeKey] ?? {
    baseHue: 210,
    hueRange: 30,
    saturation: 50,
    lightness: 50,
  };

  // Apply mood modifiers
  const moodKey = options.mood?.toLowerCase() ?? '';
  const moodMod = moodMappings[moodKey] ?? { saturationMod: 0, lightnessMod: 0, hueShift: 0 };

  const baseHSL: HSL = {
    h: normalizeHue(themeConfig.baseHue + moodMod.hueShift),
    s: clamp(themeConfig.saturation + moodMod.saturationMod, 5, 95),
    l: clamp(themeConfig.lightness + moodMod.lightnessMod, 10, 85),
  };

  const methods: HarmonyMethod[] = ['complementary', 'analogous', 'triadic'];
  const palettes: Palette[] = [];

  for (let i = 0; i < count; i++) {
    const method = methods[i % methods.length];

    // Shift the base hue slightly for each palette to create variety
    const shiftedBase: HSL = {
      ...baseHSL,
      h: normalizeHue(baseHSL.h + i * themeConfig.hueRange * 0.4),
    };

    const harmonyHSLs = generateHarmonyColors(shiftedBase, method);

    // Clamp all values
    const clampedHSLs = harmonyHSLs.map((hsl) => ({
      h: normalizeHue(hsl.h),
      s: clamp(hsl.s, 5, 95),
      l: clamp(hsl.l, 10, 92),
    }));

    const hexColors = clampedHSLs.map(hslToHex);

    const themeName = options.theme
      ? options.theme.charAt(0).toUpperCase() + options.theme.slice(1)
      : 'Custom';
    const moodName = options.mood
      ? options.mood.charAt(0).toUpperCase() + options.mood.slice(1)
      : '';

    const descParts = [
      `${harmonyName(method)} palette`,
      options.theme ? `inspired by ${themeName.toLowerCase()} tones` : undefined,
      options.mood ? `evoking a ${moodName.toLowerCase()} mood` : undefined,
    ].filter(Boolean);

    palettes.push({
      name: `${themeName} ${harmonyName(method)}${moodName ? ' (' + moodName + ')' : ''}`,
      description: descParts.join(', ') + '.',
      colors: hexColors,
      usage: {
        primary: hexColors[0],
        secondary: hexColors[1],
        accent: hexColors[2],
        background: hexColors[3],
        text: hexColors[4],
      },
    });
  }

  return { palettes };
}
