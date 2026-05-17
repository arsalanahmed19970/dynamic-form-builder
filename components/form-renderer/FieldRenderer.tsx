'use client';
import {
  TextField, MenuItem, FormControlLabel, Checkbox, Radio, RadioGroup,
  FormControl, FormLabel, FormHelperText, Switch, Box,
} from '@mui/material';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { Controller, useFormContext } from 'react-hook-form';
import dayjs from 'dayjs';
import type { FormField } from '@/types';

interface Props {
  field: FormField;
  disabled?: boolean;
}

export default function FieldRenderer({ field, disabled }: Props) {
  const { register, control, formState: { errors } } = useFormContext();
  const error = errors[field.name];
  const errorMsg = error?.message as string | undefined;

  const commonProps = {
    label: field.label,
    fullWidth: true,
    size: 'small' as const,
    disabled,
    error: !!error,
    helperText: errorMsg,
    placeholder: field.placeholder,
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
      return <TextField {...register(field.name)} {...commonProps} type={field.type} />;

    case 'textarea':
      return <TextField {...register(field.name)} {...commonProps} multiline rows={3} />;

    case 'date':
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: f }) => (
            <DatePicker
              label={field.label}
              value={f.value ? dayjs(f.value as string) : null}
              onChange={(val) => f.onChange(val ? val.toISOString() : '')}
              disabled={disabled}
              slotProps={{ textField: { size: 'small', fullWidth: true, error: !!error, helperText: errorMsg } }}
            />
          )}
        />
      );

    case 'datetime':
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: f }) => (
            <DateTimePicker
              label={field.label}
              value={f.value ? dayjs(f.value as string) : null}
              onChange={(val) => f.onChange(val ? val.toISOString() : '')}
              disabled={disabled}
              slotProps={{ textField: { size: 'small', fullWidth: true, error: !!error, helperText: errorMsg } }}
            />
          )}
        />
      );

    case 'dropdown':
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: f }) => (
            <TextField {...f} select {...commonProps}>
              <MenuItem value=""><em>Select...</em></MenuItem>
              {field.options?.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          )}
        />
      );

    case 'radio':
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: f }) => (
            <FormControl error={!!error} disabled={disabled}>
              <FormLabel>{field.label}{field.required && ' *'}</FormLabel>
              <RadioGroup {...f} row>
                {field.options?.map((opt) => (
                  <FormControlLabel key={opt.value} value={opt.value} control={<Radio size="small" />} label={opt.label} />
                ))}
              </RadioGroup>
              {errorMsg && <FormHelperText>{errorMsg}</FormHelperText>}
            </FormControl>
          )}
        />
      );

    case 'checkbox':
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: f }) => (
            <FormControl error={!!error} disabled={disabled}>
              <FormControlLabel
                control={<Checkbox {...f} checked={!!f.value} />}
                label={`${field.label}${field.required ? ' *' : ''}`}
              />
              {errorMsg && <FormHelperText>{errorMsg}</FormHelperText>}
            </FormControl>
          )}
        />
      );

    case 'toggle':
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: f }) => (
            <FormControl error={!!error} disabled={disabled}>
              <FormControlLabel
                control={<Switch {...f} checked={!!f.value} />}
                label={`${field.label}${field.required ? ' *' : ''}`}
              />
              {errorMsg && <FormHelperText>{errorMsg}</FormHelperText>}
            </FormControl>
          )}
        />
      );

    default:
      return <Box />;
  }
}
