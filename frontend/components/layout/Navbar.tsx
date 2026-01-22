'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-[rgb(var(--border))] py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="text-xl font-bold text-[rgb(var(--primary))]">
            FlowTask
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <div className="ml-10 flex items-center space-x-4">
           
            <Link
              href="/login"
              className="text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2 rounded-md text-sm font-medium hover:bg-[rgb(var(--primary)/0.9)] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
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
            <Link
              href="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary)/0.5)]"
            >
              Profile
            </Link>
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary)/0.5)]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="block px-3 py-2 rounded-md text-base font-medium bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:bg-[rgb(var(--primary)/0.9)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}