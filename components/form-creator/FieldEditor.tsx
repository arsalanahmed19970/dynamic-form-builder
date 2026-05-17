'use client';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  TextField, MenuItem, FormControlLabel, Checkbox, Typography, Divider,
  IconButton, Box, Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import type { FormField, FieldType, FormSection } from '@/types';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'password', label: 'Password' },
  { value: 'textarea', label: 'TextArea' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'DateTime' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Group' },
  { value: 'toggle', label: 'Toggle (Switch)' },
];

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_empty', label: 'Not Empty' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (field: Omit<FormField, 'id'>) => void;
  initial?: FormField;
  sections: FormSection[];
  allFields: FormField[];
}

type FormValues = Omit<FormField, 'id' | 'options'> & {
  options: { label: string; value: string }[];
  hasConditional: boolean;
};

export default function FieldEditor({ open, onClose, onSave, initial, sections, allFields }: Props) {
  const { control, handleSubmit, watch, register, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      type: initial?.type ?? 'text',
      label: initial?.label ?? '',
      name: initial?.name ?? '',
      placeholder: initial?.placeholder ?? '',
      required: initial?.required ?? false,
      defaultValue: (initial?.defaultValue as string) ?? '',
      colSpan: initial?.colSpan ?? 1,
      sectionId: initial?.sectionId ?? '',
      options: initial?.options ?? [{ label: '', value: '' }],
      validation: initial?.validation ?? {},
      hasConditional: !!initial?.conditional,
      conditional: initial?.conditional ?? { dependsOn: '', operator: 'equals', value: '' },
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
  const fieldType = watch('type');
  const hasConditional = watch('hasConditional');
  const hasOptions = ['dropdown', 'radio'].includes(fieldType);

  const onSubmit = (data: FormValues) => {
    const { hasConditional: _, options, ...rest } = data;
    onSave({
      ...rest,
      options: hasOptions ? options.filter((o) => o.label && o.value) : undefined,
      conditional: _ && data.conditional?.dependsOn ? data.conditional : undefined,
    } as Omit<FormField, 'id'>);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initial ? 'Edit Field' : 'Add Field'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Field Type" fullWidth size="small">
                    {FIELD_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="colSpan"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Column Span" fullWidth size="small">
                    {[1, 2, 3, 4].map((n) => <MenuItem key={n} value={n}>{n} Column{n > 1 ? 's' : ''}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                {...register('label', { required: 'Label is required' })}
                label="Label" fullWidth size="small"
                error={!!errors.label} helperText={errors.label?.message}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                {...register('name', { required: 'Name is required', pattern: { value: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: 'Alphanumeric & underscore only' } })}
                label="Field Name (key)" fullWidth size="small"
                error={!!errors.name} helperText={errors.name?.message}
              />
            </Grid>
            {!['checkbox', 'toggle', 'date', 'datetime'].includes(fieldType) && (
              <Grid size={6}>
                <TextField {...register('placeholder')} label="Placeholder" fullWidth size="small" />
              </Grid>
            )}
            <Grid size={6}>
              <TextField {...register('defaultValue')} label="Default Value" fullWidth size="small" />
            </Grid>
            {sections.length > 0 && (
              <Grid size={6}>
                <Controller
                  name="sectionId"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Section" fullWidth size="small">
                      <MenuItem value="">No Section</MenuItem>
                      {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>)}
                    </TextField>
                  )}
                />
              </Grid>
            )}
            <Grid size={12}>
              <Controller
                name="required"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Required" />
                )}
              />
            </Grid>

            {/* Validation */}
            {!['checkbox', 'toggle', 'date', 'datetime', 'dropdown', 'radio'].includes(fieldType) && (
              <>
                <Grid size={12}><Divider><Typography variant="caption">Validation Rules</Typography></Divider></Grid>
                <Grid size={3}>
                  <TextField {...register('validation.minLength', { valueAsNumber: true })} label="Min Length" type="number" fullWidth size="small" />
                </Grid>
                <Grid size={3}>
                  <TextField {...register('validation.maxLength', { valueAsNumber: true })} label="Max Length" type="number" fullWidth size="small" />
                </Grid>
                <Grid size={6}>
                  <TextField {...register('validation.pattern')} label="Regex Pattern" fullWidth size="small" />
                </Grid>
                <Grid size={12}>
                  <TextField {...register('validation.patternMessage')} label="Pattern Error Message" fullWidth size="small" />
                </Grid>
              </>
            )}

            {/* Options */}
            {hasOptions && (
              <>
                <Grid size={12}><Divider><Typography variant="caption">Options</Typography></Divider></Grid>
                {fields.map((f, i) => (
                  <Grid size={12} key={f.id}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField {...register(`options.${i}.label`)} label="Label" size="small" sx={{ flex: 1 }} />
                      <TextField {...register(`options.${i}.value`)} label="Value" size="small" sx={{ flex: 1 }} />
                      <IconButton size="small" onClick={() => remove(i)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Grid>
                ))}
                <Grid size={12}>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => append({ label: '', value: '' })}>
                    Add Option
                  </Button>
                </Grid>
              </>
            )}

            {/* Conditional */}
            <Grid size={12}><Divider><Typography variant="caption">Conditional Rendering</Typography></Divider></Grid>
            <Grid size={12}>
              <Controller
                name="hasConditional"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Enable conditional rendering" />
                )}
              />
            </Grid>
            {hasConditional && (
              <>
                <Grid size={4}>
                  <Controller
                    name="conditional.dependsOn"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Depends On Field" fullWidth size="small">
                        {allFields.filter((f) => f.name !== watch('name')).map((f) => (
                          <MenuItem key={f.id} value={f.name}>{f.label}</MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={4}>
                  <Controller
                    name="conditional.operator"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Operator" fullWidth size="small">
                        {OPERATORS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={4}>
                  <TextField {...register('conditional.value')} label="Value" fullWidth size="small" />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disableElevation>Save Field</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
