import React from 'react';
import { cn } from '../../lib/utils';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
}

export function Link({ href, children, icon, active }: LinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors',
        active
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      {icon}
      <div>{children}</div>
    </a>
  );
}