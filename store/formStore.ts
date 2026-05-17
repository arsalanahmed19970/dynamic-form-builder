import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { FormSchema, FormSubmission, FormField, FormSection } from '@/types';

interface FormStore {
  forms: FormSchema[];
  submissions: FormSubmission[];
  drafts: Record<string, Record<string, unknown>>;

  // Form CRUD
  addForm: (form: Omit<FormSchema, 'id' | 'version' | 'createdAt' | 'updatedAt'>) => string;
  updateForm: (id: string, updates: Partial<Omit<FormSchema, 'id' | 'createdAt'>>) => void;
  deleteForm: (id: string) => void;
  getForm: (id: string) => FormSchema | undefined;

  // Field operations
  addField: (formId: string, field: Omit<FormField, 'id'>) => void;
  updateField: (formId: string, fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (formId: string, fieldId: string) => void;
  reorderFields: (formId: string, fields: FormField[]) => void;

  // Section operations
  addSection: (formId: string, section: Omit<FormSection, 'id'>) => void;
  updateSection: (formId: string, sectionId: string, updates: Partial<FormSection>) => void;
  deleteSection: (formId: string, sectionId: string) => void;

  // Submissions
  submitForm: (formId: string, data: Record<string, unknown>, isDraft?: boolean) => string;
  updateSubmission: (id: string, data: Record<string, unknown>) => void;
  deleteSubmission: (id: string) => void;
  getSubmission: (id: string) => FormSubmission | undefined;
  getFormSubmissions: (formId: string) => FormSubmission[];

  // Drafts
  saveDraft: (formId: string, data: Record<string, unknown>) => void;
  getDraft: (formId: string) => Record<string, unknown> | undefined;
  clearDraft: (formId: string) => void;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      forms: [],
      submissions: [],
      drafts: {},

      addForm: (form) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        set((s) => ({
          forms: [...s.forms, { ...form, id, version: 1, createdAt: now, updatedAt: now }],
        }));
        return id;
      },

      updateForm: (id, updates) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === id
              ? { ...f, ...updates, version: f.version + 1, updatedAt: new Date().toISOString() }
              : f
          ),
        }));
      },

      deleteForm: (id) => {
        set((s) => ({
          forms: s.forms.filter((f) => f.id !== id),
          submissions: s.submissions.filter((sub) => sub.formId !== id),
        }));
      },

      getForm: (id) => get().forms.find((f) => f.id === id),

      addField: (formId, field) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  fields: [...f.fields, { ...field, id: uuidv4() }],
                  version: f.version + 1,
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      updateField: (formId, fieldId, updates) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  fields: f.fields.map((field) =>
                    field.id === fieldId ? { ...field, ...updates } : field
                  ),
                  version: f.version + 1,
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      deleteField: (formId, fieldId) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  fields: f.fields.filter((field) => field.id !== fieldId),
                  version: f.version + 1,
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      reorderFields: (formId, fields) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === formId
              ? { ...f, fields, version: f.version + 1, updatedAt: new Date().toISOString() }
              : f
          ),
        }));
      },

      addSection: (formId, section) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  sections: [...f.sections, { ...section, id: uuidv4() }],
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      updateSection: (formId, sectionId, updates) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  sections: f.sections.map((sec) =>
                    sec.id === sectionId ? { ...sec, ...updates } : sec
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      deleteSection: (formId, sectionId) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  sections: f.sections.filter((sec) => sec.id !== sectionId),
                  fields: f.fields.map((field) =>
                    field.sectionId === sectionId ? { ...field, sectionId: undefined } : field
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      submitForm: (formId, data, isDraft = false) => {
        const id = uuidv4();
        const form = get().forms.find((f) => f.id === formId);
        const now = new Date().toISOString();
        set((s) => ({
          submissions: [
            ...s.submissions,
            { id, formId, formVersion: form?.version ?? 1, data, isDraft, createdAt: now, updatedAt: now },
          ],
        }));
        return id;
      },

      updateSubmission: (id, data) => {
        set((s) => ({
          submissions: s.submissions.map((sub) =>
            sub.id === id ? { ...sub, data, isDraft: false, updatedAt: new Date().toISOString() } : sub
          ),
        }));
      },

      deleteSubmission: (id) => {
        set((s) => ({ submissions: s.submissions.filter((sub) => sub.id !== id) }));
      },

      getSubmission: (id) => get().submissions.find((s) => s.id === id),

      getFormSubmissions: (formId) => get().submissions.filter((s) => s.formId === formId),

      saveDraft: (formId, data) => {
        set((s) => ({ drafts: { ...s.drafts, [formId]: data } }));
      },

      getDraft: (formId) => get().drafts[formId],

      clearDraft: (formId) => {
        set((s) => {
          const drafts = { ...s.drafts };
          delete drafts[formId];
          return { drafts };
        });
      },
    }),
    { name: 'form-builder-store' }
  )
);
