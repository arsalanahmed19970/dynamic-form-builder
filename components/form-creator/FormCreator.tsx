'use client';
import { useState } from 'react';
import {
  Box, Button, Typography, Paper, Grid, TextField, Divider,
  Accordion, AccordionSummary, AccordionDetails, Chip, Alert,
  IconButton, Tooltip, Stack, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormStore } from '@/store/formStore';
import FieldEditor from './FieldEditor';
import SectionEditor from './SectionEditor';
import type { FormField, FormSection } from '@/types';
import { useHydrated } from '@/lib/useHydrated';

interface Props {
  formId: string;
}

export default function FormCreator({ formId }: Props) {
  const { getForm, addField, updateField, deleteField, reorderFields, addSection, updateSection, deleteSection, updateForm } = useFormStore();
  const form = getForm(formId);
  const hydrated = useHydrated();

  const [fieldEditorOpen, setFieldEditorOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | undefined>();
  const [sectionEditorOpen, setSectionEditorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<FormSection | undefined>();
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaName, setMetaName] = useState(form?.name ?? '');
  const [metaDesc, setMetaDesc] = useState(form?.description ?? '');

  if (!hydrated) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (!form) return <Alert severity="error">Form not found</Alert>;

  const sortedSections = [...form.sections].sort((a, b) => a.order - b.order);
  const unsectionedFields = form.fields.filter((f) => !f.sectionId);

  const moveField = (index: number, dir: -1 | 1) => {
    const newFields = [...form.fields];
    const target = index + dir;
    if (target < 0 || target >= newFields.length) return;
    [newFields[index], newFields[target]] = [newFields[target], newFields[index]];
    reorderFields(formId, newFields);
  };

  const handleSaveField = (fieldData: Omit<FormField, 'id'>) => {
    if (editingField) {
      updateField(formId, editingField.id, fieldData);
    } else {
      addField(formId, fieldData);
    }
    setEditingField(undefined);
  };

  const handleSaveSection = (sectionData: Omit<FormSection, 'id'>) => {
    if (editingSection) {
      updateSection(formId, editingSection.id, sectionData);
    } else {
      addSection(formId, sectionData);
    }
    setEditingSection(undefined);
  };

  const renderFieldList = (fields: FormField[]) =>
    fields.map((field, i) => {
      const globalIndex = form.fields.indexOf(field);
      return (
        <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Stack>
            <IconButton size="small" onClick={() => moveField(globalIndex, -1)} disabled={globalIndex === 0}><ArrowUpwardIcon fontSize="small" /></IconButton>
            <IconButton size="small" onClick={() => moveField(globalIndex, 1)} disabled={globalIndex === form.fields.length - 1}><ArrowDownwardIcon fontSize="small" /></IconButton>
          </Stack>
          <Paper variant="outlined" sx={{ flex: 1, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, '&:hover': { borderColor: 'primary.main' } }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{field.label}</Typography>
                <Chip label={field.type} size="small" color="primary" variant="outlined" />
                <Chip label={`${field.colSpan} col`} size="small" variant="outlined" />
                {field.required && <Chip label="required" size="small" color="error" variant="outlined" />}
                {field.conditional && <Chip label="conditional" size="small" color="warning" variant="outlined" />}
              </Box>
              <Typography variant="caption" color="text.secondary">{field.name}</Typography>
            </Box>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => { setEditingField(field); setFieldEditorOpen(true); }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => deleteField(formId, field.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        </Box>
      );
    });

  return (
    <Box>
      {/* Meta */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {editingMeta ? (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <TextField value={metaName} onChange={(e) => setMetaName(e.target.value)} label="Form Name" size="small" sx={{ flex: 1, minWidth: 200 }} />
            <TextField value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} label="Description" size="small" sx={{ flex: 2, minWidth: 200 }} />
            <Button variant="contained" disableElevation size="small" onClick={() => { updateForm(formId, { name: metaName, description: metaDesc }); setEditingMeta(false); }}>Save</Button>
            <Button size="small" onClick={() => setEditingMeta(false)}>Cancel</Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5">{form.name}</Typography>
              {form.description && <Typography variant="body2" color="text.secondary">{form.description}</Typography>}
              <Chip label={`v${form.version}`} size="small" sx={{ mt: 0.5 }} />
            </Box>
            <Button startIcon={<EditIcon />} size="small" onClick={() => { setMetaName(form.name); setMetaDesc(form.description ?? ''); setEditingMeta(true); }}>Edit</Button>
            <Button startIcon={<CodeIcon />} size="small" variant="outlined" onClick={() => setSchemaOpen(!schemaOpen)}>
              {schemaOpen ? 'Hide' : 'View'} Schema
            </Button>
          </Box>
        )}
      </Paper>

      {/* JSON Schema */}
      {schemaOpen && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#1e1e2e' }}>
          <Typography variant="caption" color="grey.400" sx={{ display: 'block', mb: 1 }}>JSON Schema</Typography>
          <Box component="pre" sx={{ color: '#cdd6f4', fontSize: 12, overflow: 'auto', maxHeight: 400, m: 0 }}>
            {JSON.stringify(form, null, 2)}
          </Box>
        </Paper>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => { setEditingField(undefined); setFieldEditorOpen(true); }}>
          Add Field
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setEditingSection(undefined); setSectionEditorOpen(true); }}>
          Add Section
        </Button>
      </Box>

      {/* Sections */}
      {sortedSections.map((section) => {
        const sectionFields = form.fields.filter((f) => f.sectionId === section.id);
        return (
          <Accordion key={section.id} defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, pr: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>{section.title}</Typography>
                <Chip label={`${sectionFields.length} fields`} size="small" />
                {/* Use Box with role="group" instead of buttons to avoid nested <button> inside AccordionSummary's <button> */}
                <Box
                  component="span"
                  sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Box
                    component="span"
                    role="button"
                    tabIndex={0}
                    aria-label="Edit section"
                    onClick={() => { setEditingSection(section); setSectionEditorOpen(true); }}
                    onKeyDown={(e) => e.key === 'Enter' && (setEditingSection(section), setSectionEditorOpen(true))}
                    sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 1, cursor: 'pointer', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'primary.main' } }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </Box>
                  <Box
                    component="span"
                    role="button"
                    tabIndex={0}
                    aria-label="Delete section"
                    onClick={() => deleteSection(formId, section.id)}
                    onKeyDown={(e) => e.key === 'Enter' && deleteSection(formId, section.id)}
                    sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 1, cursor: 'pointer', color: 'text.secondary', '&:hover': { bgcolor: 'error.lighter', color: 'error.main' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {section.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{section.description}</Typography>}
              {sectionFields.length === 0 ? (
                <Typography variant="body2" color="text.disabled">No fields in this section</Typography>
              ) : renderFieldList(sectionFields)}
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Unsectioned fields */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          {sortedSections.length > 0 ? 'Unsectioned Fields' : 'Fields'}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {form.fields.length === 0 ? (
          <Typography variant="body2" color="text.disabled">No fields yet. Click &quot;Add Field&quot; to get started.</Typography>
        ) : unsectionedFields.length === 0 && sortedSections.length > 0 ? (
          <Typography variant="body2" color="text.disabled">All fields are assigned to sections.</Typography>
        ) : renderFieldList(unsectionedFields)}
      </Paper>

      <FieldEditor
        open={fieldEditorOpen}
        onClose={() => { setFieldEditorOpen(false); setEditingField(undefined); }}
        onSave={handleSaveField}
        initial={editingField}
        sections={form.sections}
        allFields={form.fields}
      />
      <SectionEditor
        open={sectionEditorOpen}
        onClose={() => { setSectionEditorOpen(false); setEditingSection(undefined); }}
        onSave={handleSaveSection}
        initial={editingSection}
        order={form.sections.length}
      />
    </Box>
  );
}
