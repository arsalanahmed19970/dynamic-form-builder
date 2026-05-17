'use client';
import { use } from 'react';
import { Container, Box, Button, Alert, Breadcrumbs, Typography, CircularProgress } from '@mui/material';
import Link from 'next/link';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useFormStore } from '@/store/formStore';
import DataRenderer from '@/components/data-renderer/DataRenderer';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/lib/useHydrated';

export default function DataDetailPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);
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

  const form = getForm(formId);

  if (!form) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" action={<Button onClick={() => router.push('/data')}>Back</Button>}>
          Form not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Breadcrumbs sx={{ flex: 1 }}>
          <Link href="/data" style={{ textDecoration: 'none', color: 'inherit' }}>Data</Link>
          <Typography color="text.primary">{form.name}</Typography>
        </Breadcrumbs>
        <Button variant="outlined" startIcon={<PlayArrowIcon />} size="small" onClick={() => router.push(`/renderer/${formId}`)}>
          New Submission
        </Button>
      </Box>
      <DataRenderer form={form} />
    </Container>
  );
}
