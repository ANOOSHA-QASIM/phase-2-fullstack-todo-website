'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Button from '@/components/ui/Button';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const isChatPage = pathname === '/chat';

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 20);
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);


  return (
    <nav
  className={`
    sticky top-0 z-50
    py-4 px-4 sm:px-6 lg:px-8
    transition-all duration-300
    ${scrolled
      ? 'bg-transparent backdrop-blur-md border-b border-white/10 shadow-sm'
      : 'bg-[rgb(var(--background))] border-b border-[rgb(var(--border))] shadow-none'
    }
  `}
>


      <div className="flex justify-between items-center">
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="text-xl font-bold text-[rgb(var(--primary))]">
            TalkTodo
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <Button
                variant={isChatPage ? "outline" : "secondary"}
                size="sm"
                className="transition-all duration-200"
              >
                Task Mode
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                variant={!isChatPage ? "outline" : "secondary"}
                size="sm"
                className="transition-all duration-200"
              >
                Chat Mode
              </Button>
            </Link>
          </div>

          <ThemeToggle />

          {!pathname.includes('/login') && !pathname.includes('/signup') && (
            <>
              <Link
                href="/login"
                className="text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2 rounded-md text-sm font-medium hover:bg-[rgb(var(--primary)/0.9)] transition-colors"
              >
                Start for Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--primary))]"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {/* Hamburger icon */}
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <div className="pt-2 pb-3 space-y-1">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Link href="/dashboard">
                <Button
                  variant={isChatPage ? "outline" : "secondary"}
                  size="sm"
                  className="transition-all duration-200"
                >
                  Task Mode
                </Button>
              </Link>
              <Link href="/chat">
                <Button
                  variant={!isChatPage ? "outline" : "secondary"}
                  size="sm"
                  className="transition-all duration-200"
                >
                  Chat Mode
                </Button>
              </Link>
            </div>

            {!pathname.includes('/login') && !pathname.includes('/signup') && (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary)/0.5)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:bg-[rgb(var(--primary)/0.9)]"
                >
                  Start for Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}