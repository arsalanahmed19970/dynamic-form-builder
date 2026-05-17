<<<<<<< HEAD
# Dynamic Form Builder System

A full-featured dynamic form builder built with Next.js, React, TypeScript, Material UI, and Zustand.

## Features

### Form Creator
- Create forms with a visual field editor
- 10 field types: Text, Email, Password, TextArea, Date, DateTime, Dropdown, Checkbox, Radio Group, Toggle
- 4-column grid layout system (colSpan 1–4)
- Section & grouping support
- Field reordering (up/down arrows)
- Conditional rendering (show/hide fields based on other field values)
- Validation rules (minLength, maxLength, regex pattern)
- JSON schema viewer
- Form versioning (auto-increments on every change)

### Form Renderer
- Renders any form from its JSON schema
- Full validation with react-hook-form + zod
- Submit, Save as Draft, Clear
- Conditional field visibility
- Date/DateTime pickers
- Edit existing submissions

### Data Renderer
- List all submissions per form
- Detail view dialog
- Edit existing submission
- Delete submission
- Form version compatibility warning

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Material UI (MUI) v6**
- **Zustand** (with localStorage persistence)
- **react-hook-form** + **zod** (validation)
- **@mui/x-date-pickers** + **dayjs** (date fields)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

```
app/
  forms/          → Form Creator (list + detail/editor)
  renderer/       → Form Renderer (list + render page)
  data/           → Data Renderer (list + submissions table)

components/
  form-creator/   → FormCreator, FieldEditor, SectionEditor, FieldCard
  form-renderer/  → FormRenderer, FieldRenderer
  data-renderer/  → DataRenderer
  shared/         → Navbar, MuiProvider

store/
  formStore.ts    → Zustand store (forms, submissions, drafts)

types/
  index.ts        → All TypeScript interfaces

lib/
  validation.ts   → Zod schema builder, conditional visibility, defaults
```

## State Management (Zustand)

The store persists to `localStorage` and manages:
- `forms[]` — all form schemas with versioning
- `submissions[]` — all submitted data with form version reference
- `drafts{}` — per-form draft data (keyed by formId)

## JSON Schema

See `sample-schema.json` for a complete example. Key structure:

```json
{
  "id": "uuid",
  "name": "Form Name",
  "version": 1,
  "sections": [{ "id": "uuid", "title": "Section", "order": 0 }],
  "fields": [{
    "id": "uuid",
    "type": "text|email|password|textarea|date|datetime|dropdown|checkbox|radio|toggle",
    "label": "Field Label",
    "name": "fieldName",
    "required": true,
    "colSpan": 1,
    "validation": { "minLength": 2, "maxLength": 100 },
    "conditional": { "dependsOn": "otherField", "operator": "equals", "value": "someValue" }
  }]
}
```

## Edge Cases Handled

- **Form versioning**: Every field/section change bumps the version
- **Conditional rendering**: Fields can depend on other fields with operators: equals, not_equals, contains, not_empty
- **Version compatibility**: Submissions store the form version; a warning shows when viewing old submissions
- **Draft persistence**: Drafts survive page refresh via Zustand persist
- **Dynamic validation**: Zod schema is built at runtime from field definitions; conditional fields are excluded from validation when hidden
=======
# dynamic-form-builder
>>>>>>> ecc15dacce7e1c8738238e2b3fdd39172e65362f
