'use client';
import { useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Grid, Divider, Alert, Chip, Stack,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DraftsIcon from '@mui/icons-material/Drafts';
import ClearIcon from '@mui/icons-material/Clear';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormStore } from '@/store/formStore';
import { buildZodSchema, isFieldVisible, getDefaultValues } from '@/lib/validation';
import FieldRenderer from './FieldRenderer';
import type { FormSchema } from '@/types';

interface Props {
  form: FormSchema;
  submissionId?: string; // for editing existing submission
  onSubmitted?: (id: string) => void;
  readOnly?: boolean;
}

export default function FormRenderer({ form, submissionId, onSubmitted, readOnly }: Props) {
  const { submitForm, updateSubmission, getSubmission, saveDraft, getDraft, clearDraft } = useFormStore();

  const existingSubmission = submissionId ? getSubmission(submissionId) : undefined;
  const draft = getDraft(form.id);

  const defaultValues = existingSubmission?.data ?? draft ?? getDefaultValues(form.fields);

  const methods = useForm({
    defaultValues: defaultValues as Record<string, unknown>,
    resolver: zodResolver(buildZodSchema(form.fields)),
    mode: 'onBlur',
  });

  const { handleSubmit, watch, reset, formState: { isSubmitting } } = methods;
  const watchValues = watch() as Record<string, unknown>;

  useEffect(() => {
    reset(defaultValues as Record<string, unknown>);
  }, [submissionId]);

  const onSubmit = (data: Record<string, unknown>) => {
    if (existingSubmission) {
      updateSubmission(existingSubmission.id, data);
      clearDraft(form.id);
      onSubmitted?.(existingSubmission.id);
    } else {
      const id = submitForm(form.id, data, false);
      clearDraft(form.id);
      onSubmitted?.(id);
    }
  };

  const handleSaveDraft = () => {
    saveDraft(form.id, watchValues);
  };

  const handleClear = () => {
    reset(getDefaultValues(form.fields) as Record<string, unknown>);
    clearDraft(form.id);
  };

  const sortedSections = [...form.sections].sort((a, b) => a.order - b.order);

  const renderFields = (fields: typeof form.fields) => (
    <Grid container spacing={2}>
      {fields.map((field) => {
        if (!isFieldVisible(field, watchValues)) return null;
        return (
          <Grid key={field.id} size={field.colSpan * 3}>
            <FieldRenderer field={field} disabled={readOnly} />
          </Grid>
        );
      })}
    </Grid>
  );

  const unsectionedFields = form.fields.filter((f) => !f.sectionId);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5">{form.name}</Typography>
              {form.description && <Typography variant="body2" color="text.secondary">{form.description}</Typography>}
            </Box>
            <Chip label={`v${form.version}`} size="small" />
            {existingSubmission && <Chip label="Editing" color="warning" size="small" />}
            {draft && !existingSubmission && <Chip label="Draft loaded" color="info" size="small" />}
          </Box>

          {/* Sectioned fields */}
          {sortedSections.map((section) => {
            const sectionFields = form.fields.filter((f) => f.sectionId === section.id);
            if (sectionFields.length === 0) return null;
            return (
              <Paper key={section.id} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>{section.title}</Typography>
                {section.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{section.description}</Typography>}
                <Divider sx={{ mb: 2 }} />
                {renderFields(sectionFields)}
              </Paper>
            );
          })}

          {/* Unsectioned fields */}
          {unsectionedFields.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              {sortedSections.length > 0 && <Typography variant="h6" sx={{ mb: 2 }}>Other Fields</Typography>}
              {renderFields(unsectionedFields)}
            </Paper>
          )}

          {form.fields.length === 0 && (
            <Alert severity="info">This form has no fields yet.</Alert>
          )}

          {!readOnly && (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" disableElevation startIcon={<SaveIcon />} disabled={isSubmitting}>
                {existingSubmission ? 'Update' : 'Submit'}
              </Button>
              {!existingSubmission && (
                <Button variant="outlined" startIcon={<DraftsIcon />} onClick={handleSaveDraft}>
                  Save Draft
                </Button>
              )}
              <Button variant="text" startIcon={<ClearIcon />} onClick={handleClear} color="inherit">
                Clear
              </Button>
            </Stack>
          )}
        </form>
      </FormProvider>
    </LocalizationProvider>
  );
}
