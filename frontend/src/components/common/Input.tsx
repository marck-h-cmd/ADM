import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  mark?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, error, mark, required, children, className }: FieldProps) {
  return (
    <label className={cn('block group', className)}>
      {label && (
        <span className="flex items-baseline gap-2 mb-1.5">
          {mark && <span className="mark text-[0.6rem]">{mark}</span>}
          <span className="text-[0.7rem] font-sans uppercase tracking-[0.14em] text-[var(--color-ink-700)] group-focus-within:text-[var(--color-gold-500)] transition-colors">
            {label}
            {required && <span className="text-[var(--color-gold-500)] ml-1">∗</span>}
          </span>
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1.5 block text-[0.7rem] text-[var(--color-cinnabar-500)]">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[0.7rem] text-[var(--color-ink-600)]">{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  'w-full bg-[var(--color-ink-100)] text-[var(--color-ink-900)] ' +
  'border border-[var(--color-border-hairline)] px-3.5 h-10 ' +
  'font-sans text-sm placeholder:text-[var(--color-ink-600)] ' +
  'transition-colors duration-200 ' +
  'hover:border-[var(--color-border-hairline-strong)] ' +
  'focus:outline-none focus:border-[var(--color-gold-500)] ' +
  'focus:bg-[var(--color-ink-200)]';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} {...rest} className={cn(inputBase, className)} />;
  },
);

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        {...rest}
        className={cn(inputBase, 'h-auto py-2.5 min-h-[88px] resize-y leading-relaxed', className)}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        {...rest}
        className={cn(inputBase, 'appearance-none cursor-pointer pr-9', className)}
      >
        {children}
      </select>
    );
  },
);
