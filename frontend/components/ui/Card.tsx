'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  animated?: boolean;
}

export default function Card({ children, className = '', title, animated = true }: CardProps) {
  return (
    <div className={animated ? "antigravity-card relative" : "antigravity-card-no-border"}>
      <div className={`relative z-10 ${className}`}>
        {title && (
          <div className="border-b border-[rgb(var(--border))] px-6 py-4">
            <h3 className="text-lg font-medium text-[rgb(var(--card-foreground))]">{title}</h3>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}