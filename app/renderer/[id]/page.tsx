'use client';
import { use, useState } from 'react';
import { Container, Box, Button, Alert, Breadcrumbs, Typography, Snackbar, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { useFormStore } from '@/store/formStore';
import FormRenderer from '@/components/form-renderer/FormRenderer';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/lib/useHydrated';

export default function RendererDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getForm } = useFormStore();
  const router = useRouter();
  const hydrated = useHydrated();
  const [snack, setSnack] = useState('');

  if (!hydrated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const form = getForm(id);

  if (!form) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={<Button onClick={() => router.push('/renderer')}>Back</Button>}>
          Form not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/renderer" style={{ textDecoration: 'none', color: 'inherit' }}>Renderer</Link>
        <Typography color="text.primary">{form.name}</Typography>
      </Breadcrumbs>

      <FormRenderer
        form={form}
        onSubmitted={() => {
          setSnack('Form submitted successfully!');
          setTimeout(() => router.push(`/data/${id}`), 1500);
        }}
      />

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack('')}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}
