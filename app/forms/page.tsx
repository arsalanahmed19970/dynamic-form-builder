'use client';
import { useState } from 'react';
import {
  Container, Box, Typography, Button, Grid, Card, CardContent,
  CardActions, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Tooltip, Alert, Stack, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useFormStore } from '@/store/formStore';
import { useHydrated } from '@/lib/useHydrated';
import dayjs from 'dayjs';

function CreateFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addForm } = useFormStore();
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string; description: string }>();

  const onSubmit = (data: { name: string; description: string }) => {
    const id = addForm({ name: data.name, description: data.description, sections: [], fields: [] });
    reset();
    onClose();
    router.push(`/forms/${id}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Form</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              {...register('name', { required: 'Form name is required' })}
              label="Form Name" fullWidth size="small"
              error={!!errors.name} helperText={errors.name?.message}
            />
            <TextField {...register('description')} label="Description (optional)" fullWidth size="small" multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disableElevation>Create</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function FormsPage() {
  const { forms, deleteForm, getFormSubmissions } = useFormStore();
  const router = useRouter();
  const hydrated = useHydrated();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4">Forms</Typography>
          <Typography variant="body2" color="text.secondary">Create and manage your dynamic forms</Typography>
        </Box>
        <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          New Form
        </Button>
      </Box>

      {!hydrated ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : forms.length === 0 ? (
        <Alert severity="info" sx={{ maxWidth: 500 }}>
          No forms yet. Click &quot;New Form&quot; to create your first form.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {forms.map((form) => {
            const submissionCount = getFormSubmissions(form.id).length;
            return (
              <Grid key={form.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={`v${form.version}`} size="small" color="primary" />
                      <Chip label={`${form.fields.length} fields`} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="h6" gutterBottom noWrap>{form.name}</Typography>
                    {form.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {form.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.disabled">
                      Updated {dayjs(form.updatedAt).format('MMM D, YYYY')}
                    </Typography>
                    {submissionCount > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Chip label={`${submissionCount} submissions`} size="small" color="success" variant="outlined" />
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box>
                      <Tooltip title="Edit Form">
                        <IconButton size="small" onClick={() => router.push(`/forms/${form.id}`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Render Form">
                        <IconButton size="small" color="primary" onClick={() => router.push(`/renderer/${form.id}`)}>
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Data">
                        <IconButton size="small" color="success" onClick={() => router.push(`/data/${form.id}`)}>
                          <TableChartIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(form.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <CreateFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Form?</DialogTitle>
        <DialogContent>
          <Typography>This will also delete all submissions. This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" disableElevation onClick={() => { deleteForm(deleteId!); setDeleteId(null); }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
