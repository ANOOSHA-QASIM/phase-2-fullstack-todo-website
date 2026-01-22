import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div
      className={`antigravity-card transition-all duration-200 hover:shadow-sm ${className}`}
    >
      {title && (
        <div className="border-b border-[rgb(var(--border))] px-6 py-4">
          <h3 className="text-lg font-medium text-[rgb(var(--card-foreground))]">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}