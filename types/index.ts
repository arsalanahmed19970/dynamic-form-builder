export type FieldType =
  | 'text' | 'email' | 'password' | 'textarea'
  | 'date' | 'datetime'
  | 'dropdown' | 'checkbox' | 'radio'
  | 'toggle';

export interface FieldOption {
  label: string;
  value: string;
}

export interface ValidationRule {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface ConditionalRule {
  dependsOn: string; // field name
  operator: 'equals' | 'not_equals' | 'contains' | 'not_empty';
  value: string | boolean;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: string | boolean | string[];
  validation?: ValidationRule;
  options?: FieldOption[];
  colSpan: 1 | 2 | 3 | 4;
  conditional?: ConditionalRule;
  sectionId?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export interface FormSchema {
  id: string;
  name: string;
  description?: string;
  version: number;
  sections: FormSection[];
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  formVersion: number;
  data: Record<string, unknown>;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}
