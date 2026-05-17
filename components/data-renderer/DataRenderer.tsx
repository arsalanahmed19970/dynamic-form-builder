'use client';
import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Tooltip, Stack,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormStore } from '@/store/formStore';
import FormRenderer from '@/components/form-renderer/FormRenderer';
import type { FormSchema, FormSubmission } from '@/types';
import dayjs from 'dayjs';

interface Props {
  form: FormSchema;
}

function SubmissionDetail({ submission, form }: { submission: FormSubmission; form: FormSchema }) {
  return (
    <Box>
      {submission.formVersion !== form.version && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Submitted on form v{submission.formVersion}, current version is v{form.version}
        </Alert>
      )}
      <Stack spacing={1}>
        {form.fields.map((field) => {
          const val = submission.data[field.name];
          if (val === undefined || val === '') return null;
          return (
            <Box key={field.id} sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 150, fontWeight: 500 }}>
                {field.label}:
              </Typography>
              <Typography variant="body2">
                {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

export default function DataRenderer({ form }: Props) {
  const { getFormSubmissions, deleteSubmission } = useFormStore();
  const submissions = getFormSubmissions(form.id);

  const [viewSub, setViewSub] = useState<FormSubmission | null>(null);
  const [editSubId, setEditSubId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getPreview = (sub: FormSubmission) => {
    const firstField = form.fields[0];
    if (!firstField) return sub.id.slice(0, 8);
    const val = sub.data[firstField.name];
    return val ? String(val).slice(0, 30) : sub.id.slice(0, 8);
  };

  if (editSubId) {
    return (
      <Box>
        <Button onClick={() => setEditSubId(null)} sx={{ mb: 2 }}>← Back to list</Button>
        <FormRenderer
          form={form}
          submissionId={editSubId}
          onSubmitted={() => setEditSubId(null)}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ flex: 1 }}>{form.name} — Submissions</Typography>
        <Chip label={`${submissions.length} records`} />
      </Box>

      {submissions.length === 0 ? (
        <Alert severity="info">No submissions yet.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>#</strong></TableCell>
                <TableCell><strong>Preview</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Version</strong></TableCell>
                <TableCell><strong>Submitted</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((sub, i) => (
                <TableRow key={sub.id} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{getPreview(sub)}</TableCell>
                  <TableCell>
                    <Chip
                      label={sub.isDraft ? 'Draft' : 'Submitted'}
                      size="small"
                      color={sub.isDraft ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`v${sub.formVersion}`}
                      size="small"
                      color={sub.formVersion !== form.version ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{dayjs(sub.createdAt).format('MMM D, YYYY HH:mm')}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => setViewSub(sub)}><VisibilityIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => setEditSubId(sub.id)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(sub.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewSub} onClose={() => setViewSub(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Submission Detail</DialogTitle>
        <DialogContent dividers>
          {viewSub && <SubmissionDetail submission={viewSub} form={form} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewSub(null)}>Close</Button>
          {viewSub && (
            <Button variant="contained" disableElevation onClick={() => { setEditSubId(viewSub.id); setViewSub(null); }}>
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Submission?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" disableElevation onClick={() => { deleteSubmission(deleteId!); setDeleteId(null); }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
