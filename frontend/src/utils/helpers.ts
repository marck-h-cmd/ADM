export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isoDate(d: Date = new Date()): string {
  return d.toISOString().split('T')[0];
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function getErrorMessage(err: unknown, fallback = 'Algo salió mal'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

export function docId(documento: string, tipoDoc: string): string {
  return `${documento}-${tipoDoc}`;
}
