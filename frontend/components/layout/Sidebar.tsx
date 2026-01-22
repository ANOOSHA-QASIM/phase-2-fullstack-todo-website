'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/tasks', label: 'All Tasks', icon: '📋' },
    { href: '/tasks/add', label: 'Add Task', icon: '➕' },
    { href: '/tasks/pending', label: 'Pending', icon: '⏳' },
    { href: '/tasks/completed', label: 'Completed', icon: '✅' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[rgb(var(--primary))] text-white"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[rgb(var(--card))] border-r border-[rgb(var(--border))] transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border))]">
          <Link href="/" className="text-xl font-bold text-[rgb(var(--primary))]">
            FlowTask
          </Link>
          <button
            className="md:hidden text-[rgb(var(--foreground))]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]'
                      : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary)/0.5)]'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
}