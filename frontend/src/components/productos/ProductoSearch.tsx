import { useEffect, useRef, type ChangeEvent } from 'react';
import { Input } from '@/components/common/Input';
import { cn } from '@/utils/helpers';

interface ProductoSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function ProductoSearch({
  value,
  onChange,
  placeholder = 'Buscar por SKU o descripción…',
  className,
}: ProductoSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={cn('relative flex items-center', className)}>
      <svg
        className="absolute left-3.5 text-[var(--color-ink-600)] pointer-events-none"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-20 h-10"
      />
      <kbd className="hidden md:flex absolute right-3 items-center gap-1 text-[0.6rem] num text-[var(--color-ink-600)] pointer-events-none">
        <span className="px-1 py-0.5 hairline">⌘</span>
        <span className="px-1 py-0.5 hairline">K</span>
      </kbd>
    </div>
  );
}
