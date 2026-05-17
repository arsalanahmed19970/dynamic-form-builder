'use client';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import type { FormSection } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (section: Omit<FormSection, 'id'>) => void;
  initial?: FormSection;
  order: number;
}

export default function SectionEditor({ open, onClose, onSave, initial, order }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { title: initial?.title ?? '', description: initial?.description ?? '', order: initial?.order ?? order },
  });

  const onSubmit = (data: { title: string; description: string; order: number }) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? 'Edit Section' : 'Add Section'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                {...register('title', { required: 'Title is required' })}
                label="Section Title" fullWidth size="small"
                error={!!errors.title} helperText={errors.title?.message}
              />
            </Grid>
            <Grid size={12}>
              <TextField {...register('description')} label="Description (optional)" fullWidth size="small" multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disableElevation>Save Section</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
