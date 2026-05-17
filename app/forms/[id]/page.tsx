'use client';
import { use } from 'react';
import { Container, Box, Button, Alert, Breadcrumbs, Typography, Chip, CircularProgress } from '@mui/material';
import Link from 'next/link';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useFormStore } from '@/store/formStore';
import FormCreator from '@/components/form-creator/FormCreator';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/lib/useHydrated';

export default function FormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getForm } = useFormStore();
  const router = useRouter();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const form = getForm(id);

  if (!form) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" action={<Button onClick={() => router.push('/forms')}>Back to Forms</Button>}>
          Form not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Breadcrumbs sx={{ flex: 1 }}>
          <Link href="/forms" style={{ textDecoration: 'none', color: 'inherit' }}>Forms</Link>
          <Typography color="text.primary">{form.name}</Typography>
        </Breadcrumbs>
        <Chip label={`v${form.version}`} size="small" color="primary" />
        <Button variant="outlined" startIcon={<PlayArrowIcon />} size="small" onClick={() => router.push(`/renderer/${id}`)}>
          Render
        </Button>
        <Button variant="outlined" startIcon={<TableChartIcon />} size="small" color="success" onClick={() => router.push(`/data/${id}`)}>
          View Data
        </Button>
      </Box>
      <FormCreator formId={id} />
    </Container>
  );
}
