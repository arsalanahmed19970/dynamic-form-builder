'use client';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Forms', href: '/forms' },
  { label: 'Renderer', href: '/renderer' },
  { label: 'Data', href: '/data' },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <DynamicFormIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ color: 'primary.main', flexGrow: 0, mr: 4 }}>
            FormBuilder
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
            {navLinks.map((link) => (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                variant={pathname.startsWith(link.href) ? 'contained' : 'text'}
                size="small"
                disableElevation
              >
                {link.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
