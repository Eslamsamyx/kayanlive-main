'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link
        href="/admin"
        className="flex items-center gap-1 text-[#888888] hover:text-[#7afdd6] transition-colors"
        style={{ fontFamily: '"Poppins", sans-serif' }}
      >
        <Home size={16} />
        <span>Dashboard</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={16} className="text-[#666666]" />
          {item.current || !item.href ? (
            <span
              className={`${item.current ? 'text-[#7afdd6] font-medium' : 'text-[#888888]'}`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-[#888888] hover:text-[#7afdd6] transition-colors"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}