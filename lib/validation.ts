import { z } from 'zod';
import type { FormField } from '@/types';

export function buildZodSchema(fields: FormField[], watchValues: Record<string, unknown> = {}) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (!isFieldVisible(field, watchValues)) continue;

    let schema: z.ZodTypeAny;
    const v = field.validation ?? {};

    switch (field.type) {
      case 'checkbox':
        schema = z.boolean();
        break;
      case 'dropdown':
      case 'radio':
        schema = z.string();
        break;
      default: {
        let s = z.string();
        if (v.minLength) s = s.min(v.minLength, `Min ${v.minLength} characters`);
        if (v.maxLength) s = s.max(v.maxLength, `Max ${v.maxLength} characters`);
        if (v.pattern) s = s.regex(new RegExp(v.pattern), v.patternMessage ?? 'Invalid format');
        if (field.type === 'email') s = s.email('Invalid email address');
        schema = s;
      }
    }

    if (!field.required) {
      schema = schema.optional();
    } else if (field.type !== 'checkbox') {
      schema = (schema as z.ZodString).min(1, `${field.label} is required`);
    }

    shape[field.name] = schema;
  }

  return z.object(shape);
}

export function isFieldVisible(field: FormField, values: Record<string, unknown>): boolean {
  if (!field.conditional) return true;
  const { dependsOn, operator, value } = field.conditional;
  const depValue = values[dependsOn];

  switch (operator) {
    case 'equals': return depValue === value;
    case 'not_equals': return depValue !== value;
    case 'contains': return typeof depValue === 'string' && depValue.includes(String(value));
    case 'not_empty': return depValue !== undefined && depValue !== '' && depValue !== null;
    default: return true;
  }
}

export function getDefaultValues(fields: FormField[]): Record<string, unknown> {
  return fields.reduce((acc, field) => {
    if (field.defaultValue !== undefined) {
      acc[field.name] = field.defaultValue;
    } else if (field.type === 'checkbox' || field.type === 'toggle') {
      acc[field.name] = false;
    } else {
      acc[field.name] = '';
    }
    return acc;
  }, {} as Record<string, unknown>);
}
