import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskFlow - Smart Task Management',
  description: 'Plan smarter. Finish faster. Stay in control.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[rgb(var(--background))] text-[rgb(var(--foreground))]`}>{children}</body>
    </html>
  );
}