import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TalkTodo - Professional Task Management',
  description: 'Your Tasks, Smarter. Your Day, Easier.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[rgb(var(--background))] text-[rgb(var(--foreground))]`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}