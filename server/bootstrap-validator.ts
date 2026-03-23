const KEBAB_CASE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME_LEN = 50;
const MAX_SKILL_SIZE = 50 * 1024;   // 50KB
const MAX_PROMPT_SIZE = 10 * 1024;   // 10KB

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { ok: false, error: 'Invalid name: must be a non-empty string' };
  }
  if (name.length > MAX_NAME_LEN) {
    return { ok: false, error: `Invalid name: exceeds ${MAX_NAME_LEN} characters` };
  }
  if (name.includes('..') || name.includes('/') || name.includes('\\') || name.includes('\0')) {
    return { ok: false, error: 'Invalid name: contains path traversal characters' };
  }
  if (!KEBAB_CASE_RE.test(name)) {
    return { ok: false, error: 'Invalid name: must be kebab-case (e.g. "oil-paint")' };
  }
  return { ok: true };
}

export function validateSkillContent(content: string): ValidationResult {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return { ok: false, error: 'Skill content must be a non-empty string' };
  }
  if (content.length > MAX_SKILL_SIZE) {
    return { ok: false, error: `Skill content exceeds ${MAX_SKILL_SIZE / 1024}KB limit` };
  }
  return { ok: true };
}

export function validateFilterDefinition(definition: {
  description?: string;
  svg_template?: string;
  params_schema?: Record<string, { type?: string; default?: unknown; min?: number; max?: number }>;
}): ValidationResult {
  if (!definition || typeof definition !== 'object') {
    return { ok: false, error: 'Filter definition must be an object' };
  }
  if (!definition.description || typeof definition.description !== 'string') {
    return { ok: false, error: 'Filter definition must have a description string' };
  }
  if (!definition.svg_template || typeof definition.svg_template !== 'string') {
    return { ok: false, error: 'Filter definition must have an svg_template string' };
  }
  if (!definition.svg_template.includes('<filter')) {
    return { ok: false, error: 'Filter svg_template must contain a <filter> element' };
  }
  if (definition.params_schema) {
    for (const [key, schema] of Object.entries(definition.params_schema)) {
      if (!schema.type || !['number', 'string'].includes(schema.type)) {
        return { ok: false, error: `Param "${key}" must have type "number" or "string"` };
      }
      if (schema.default === undefined) {
        return { ok: false, error: `Param "${key}" must have a default value` };
      }
      if (schema.type === 'number' && schema.min !== undefined && schema.max !== undefined) {
        if (schema.min > schema.max) {
          return { ok: false, error: `Param "${key}": min must be <= max` };
        }
        const def = Number(schema.default);
        if (def < schema.min || def > schema.max) {
          return { ok: false, error: `Param "${key}": default must be between min and max` };
        }
      }
    }
  }
  return { ok: true };
}

export function validateStyleDefinition(definition: {
  description?: string;
  layer_styles?: Record<string, Record<string, string>>;
}): ValidationResult {
  if (!definition || typeof definition !== 'object') {
    return { ok: false, error: 'Style definition must be an object' };
  }
  if (!definition.description || typeof definition.description !== 'string') {
    return { ok: false, error: 'Style definition must have a description string' };
  }
  if (!definition.layer_styles || typeof definition.layer_styles !== 'object' || Object.keys(definition.layer_styles).length === 0) {
    return { ok: false, error: 'Style definition must have non-empty layer_styles' };
  }
  return { ok: true };
}

export function validatePromptExtension(content: string): ValidationResult {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return { ok: false, error: 'Prompt extension content must be a non-empty string' };
  }
  if (content.length > MAX_PROMPT_SIZE) {
    return { ok: false, error: `Prompt extension exceeds ${MAX_PROMPT_SIZE / 1024}KB limit` };
  }
  return { ok: true };
}
