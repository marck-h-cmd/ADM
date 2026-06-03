export const isEmail = (v: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const isRuc = (v: string): boolean => /^\d{11}$/.test(v.trim());

export const isDni = (v: string): boolean => /^\d{8}$/.test(v.trim());

export const required = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

export const minLen = (n: number) => (v: string): boolean =>
  typeof v === 'string' && v.trim().length >= n;

export const maxLen = (n: number) => (v: string): boolean =>
  typeof v === 'string' && v.trim().length <= n;

export const isPositive = (v: number | string): boolean => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) && n > 0;
};

export const isNonNegative = (v: number | string): boolean => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) && n >= 0;
};
