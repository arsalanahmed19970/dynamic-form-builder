'use client';
import { Container, Typography, Grid, Card, CardContent, CardActionArea, Chip, Box, Alert, Button, CircularProgress } from '@mui/material';
import { useFormStore } from '@/store/formStore';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/lib/useHydrated';
import AddIcon from '@mui/icons-material/Add';

export default function RendererPage() {
  const { forms } = useFormStore();
  const router = useRouter();
  const hydrated = useHydrated();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Form Renderer</Typography>
        <Typography variant="body2" color="text.secondary">Select a form to fill out</Typography>
      </Box>

      {!hydrated ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : forms.length === 0 ? (
        <Alert severity="info" action={<Button startIcon={<AddIcon />} onClick={() => router.push('/forms')}>Create Form</Button>}>
          No forms available. Create a form first.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {forms.map((form) => (
            <Grid key={form.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardActionArea onClick={() => router.push(`/renderer/${form.id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip label={`v${form.version}`} size="small" color="primary" />
                      <Chip label={`${form.fields.length} fields`} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="h6">{form.name}</Typography>
                    {form.description && <Typography variant="body2" color="text.secondary">{form.description}</Typography>}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
