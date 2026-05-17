'use client';
import { Card, CardContent, Box, Typography, IconButton, Chip, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { FormField } from '@/types';

interface Props {
  field: FormField;
  onEdit: () => void;
  onDelete: () => void;
  dragHandleProps?: Record<string, unknown>;
}

const TYPE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  text: 'default', email: 'info', password: 'warning', textarea: 'default',
  date: 'success', datetime: 'success', dropdown: 'primary', checkbox: 'secondary',
  radio: 'secondary', toggle: 'secondary',
};

export default function FieldCard({ field, onEdit, onDelete, dragHandleProps }: Props) {
  return (
    <Card variant="outlined" sx={{ mb: 1, '&:hover': { borderColor: 'primary.main' } }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box {...dragHandleProps} sx={{ cursor: 'grab', color: 'text.disabled', display: 'flex' }}>
            <DragIndicatorIcon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{field.label}</Typography>
              <Chip label={field.type} size="small" color={TYPE_COLORS[field.type] ?? 'default'} />
              <Chip label={`${field.colSpan} col`} size="small" variant="outlined" />
              {field.required && <Chip label="required" size="small" color="error" variant="outlined" />}
              {field.conditional && <Chip label="conditional" size="small" color="warning" variant="outlined" />}
            </Box>
            <Typography variant="caption" color="text.secondary">{field.name}</Typography>
          </Box>
          <Tooltip title="Edit"><IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={onDelete}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
