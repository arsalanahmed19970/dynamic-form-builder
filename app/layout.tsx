import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import MuiProvider from '@/components/shared/MuiProvider';
import Navbar from '@/components/shared/Navbar';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Dynamic Form Builder',
  description: 'Build, render, and manage dynamic forms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.variable} style={{ margin: 0 }}>
        <MuiProvider>
          <Navbar />
          {children}
        </MuiProvider>
      </body>
    </html>
  );
}
