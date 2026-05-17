'use client';
import { Container, Typography, Grid, Card, CardContent, CardActionArea, Chip, Box, Alert, Button, CircularProgress } from '@mui/material';
import { useFormStore } from '@/store/formStore';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/lib/useHydrated';
import AddIcon from '@mui/icons-material/Add';

export default function DataPage() {
  const { forms, getFormSubmissions } = useFormStore();
  const router = useRouter();
  const hydrated = useHydrated();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Data Renderer</Typography>
        <Typography variant="body2" color="text.secondary">View and manage form submissions</Typography>
      </Box>

      {!hydrated ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : forms.length === 0 ? (
        <Alert severity="info" action={<Button startIcon={<AddIcon />} onClick={() => router.push('/forms')}>Create Form</Button>}>
          No forms available.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {forms.map((form) => {
            const count = getFormSubmissions(form.id).length;
            return (
              <Grid key={form.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardActionArea onClick={() => router.push(`/data/${form.id}`)}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip label={`${count} submissions`} size="small" color={count > 0 ? 'success' : 'default'} />
                        <Chip label={`v${form.version}`} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="h6">{form.name}</Typography>
                      {form.description && <Typography variant="body2" color="text.secondary">{form.description}</Typography>}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
