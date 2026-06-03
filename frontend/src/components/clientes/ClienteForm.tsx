import { useRef, useState, type FormEvent } from 'react';
import { Field, Input, Select } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { TIPO_CLIENTE_LABELS, GENERO_LABELS } from '@/utils/constants';
import {
  required,
  isPositive,
  isNonNegative,
  maxLen,
  isRuc,
} from '@/utils/validators';
import { cn } from '@/utils/helpers';
import { fmt } from '@/utils/formatters';
import type {
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
} from '@/types/cliente.types';

interface ClienteFormProps {
  initial?: Cliente | null;
  loading?: boolean;
  error?: string | null;
  onSubmit: (
    payload: CreateClienteDTO | UpdateClienteDTO,
  ) => Promise<{ ok: boolean; error?: string }>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

interface FormState {
  Cliente: string;
  Nombre: string;
  Zona: string;
  Ruc: string;
  Direccion: string;
  credito: boolean;
  topeCredito: string;
  TipoCliente: 'V' | 'E' | 'P' | 'R';
  genero: 'M' | 'F';
  idRepresentante: string;
  Calificacion: '' | 'A' | 'B' | 'C';
}

const empty: FormState = {
  Cliente: '',
  Nombre: '',
  Zona: '',
  Ruc: '',
  Direccion: '',
  credito: false,
  topeCredito: '0',
  TipoCliente: 'R',
  genero: 'M',
  idRepresentante: '1',
  Calificacion: '',
};

function fromCliente(c?: Cliente | null): FormState {
  if (!c) return empty;
  return {
    Cliente: c.Cliente,
    Nombre: c.Nombre,
    Zona: c.Zona,
    Ruc: c.Ruc ?? '',
    Direccion: c.Direccion ?? '',
    credito: c.credito,
    topeCredito: String(c.topeCredito ?? 0),
    TipoCliente: c.TipoCliente,
    genero: c.genero ?? 'M',
    idRepresentante: String(c.idRepresentante ?? 1),
    Calificacion: (c.Calificacion ?? '') as FormState['Calificacion'],
  };
}

export function ClienteForm({
  initial,
  loading = false,
  error = null,
  onSubmit,
  onCancel,
  mode,
}: ClienteFormProps) {
  const [form, setForm] = useState<FormState>(() => fromCliente(initial));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const lastKey = useRef(initial?.Cliente);

  if (initial?.Cliente !== lastKey.current) {
    lastKey.current = initial?.Cliente;
    setForm(fromCliente(initial));
    setErrors({});
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (mode === 'create') {
      if (!required(form.Cliente) || !maxLen(9)(form.Cliente))
        e.Cliente = 'Identificador de 1-9 caracteres';
      if (!required(form.Zona) || !maxLen(2)(form.Zona))
        e.Zona = 'Código de zona de 1-2 caracteres';
    }
    if (!required(form.Nombre) || !maxLen(120)(form.Nombre))
      e.Nombre = 'Nombre requerido (máx. 120)';
    if (form.Ruc && !isRuc(form.Ruc))
      e.Ruc = 'RUC inválido (11 dígitos)';
    if (form.credito && !isPositive(form.topeCredito))
      e.topeCredito = 'Tope requerido si tiene crédito';
    if (form.topeCredito && !isNonNegative(form.topeCredito))
      e.topeCredito = 'Debe ser ≥ 0';
    if (!isPositive(form.idRepresentante))
      e.idRepresentante = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!validate()) return;
    if (mode === 'create') {
      const payload: CreateClienteDTO = {
        Cliente: form.Cliente.toUpperCase(),
        Zona: form.Zona.toUpperCase(),
        Nombre: form.Nombre.trim(),
        Direccion: form.Direccion.trim() || undefined,
        Ruc: form.Ruc || undefined,
        credito: form.credito,
        topeCredito: Number(form.topeCredito) || 0,
        TipoCliente: form.TipoCliente,
        idRepresentante: Number(form.idRepresentante),
        genero: form.genero,
      };
      const result = await onSubmit(payload);
      if (!result.ok && result.error) setErrors({ Nombre: result.error });
    } else {
      const payload: UpdateClienteDTO = {
        Nombre: form.Nombre.trim(),
        Direccion: form.Direccion.trim() || '',
        Zona: form.Zona.toUpperCase(),
        Ruc: form.Ruc,
        credito: form.credito,
        topeCredito: Number(form.topeCredito) || 0,
        TipoCliente: form.TipoCliente,
        Calificacion: (form.Calificacion || null) as 'A' | 'B' | 'C' | null,
      };
      const result = await onSubmit(payload);
      if (!result.ok && result.error) setErrors({ Nombre: result.error });
    }
  }

  const tope = Number(form.topeCredito) || 0;
  const previewSaldo = initial?.Saldo ?? 0;
  const previewPct = tope > 0 ? Math.min(100, (previewSaldo / tope) * 100) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-9 relative">
      {error && <Alert tone="cinnabar">{error}</Alert>}

      <section className="space-y-5">
        <header className="flex items-baseline gap-3">
          <span className="mark text-[0.55rem]">§ I</span>
          <h3 className="display text-lg text-[var(--color-ink-900)]">Identidad</h3>
        </header>

        <div className="grid gap-5 md:grid-cols-[140px_100px_1fr]">
          <Field
            mark="01"
            label="Código"
            required
            error={errors.Cliente}
            hint={mode === 'edit' ? 'Inmutable' : 'Identificador único'}
          >
            <Input
              value={form.Cliente}
              onChange={(e) => set('Cliente', e.target.value)}
              placeholder="CL001"
              maxLength={9}
              disabled={mode === 'edit'}
              className="num uppercase tracking-wider"
            />
          </Field>

          <Field
            mark="02"
            label="Zona"
            required
            error={errors.Zona}
            hint={mode === 'edit' ? 'Inmutable' : '1-2 chars'}
          >
            <Input
              value={form.Zona}
              onChange={(e) => set('Zona', e.target.value)}
              placeholder="01"
              maxLength={2}
              disabled={mode === 'edit'}
              className="num uppercase"
            />
          </Field>

          <Field
            mark="03"
            label="Nombre completo"
            required
            error={errors.Nombre}
          >
            <Input
              value={form.Nombre}
              onChange={(e) => set('Nombre', e.target.value)}
              placeholder="Distribuidora del Sur S.A.C."
            />
          </Field>
        </div>
      </section>

      <section className="space-y-5">
        <header className="flex items-baseline gap-3">
          <span className="mark text-[0.55rem]">§ II</span>
          <h3 className="display text-lg text-[var(--color-ink-900)]">Crédito</h3>
          <span className="mark text-[0.5rem] text-[var(--color-ink-600)]">
            {form.credito ? 'Habilitado' : 'Contado únicamente'}
          </span>
        </header>

        <div className="grid gap-5 md:grid-cols-[auto_1fr] items-end">
          <label className="flex items-end gap-3 cursor-pointer pb-2.5">
            <button
              type="button"
              onClick={() => set('credito', !form.credito)}
              className={cn(
                'h-10 w-10 grid place-items-center hairline transition-all',
                form.credito
                  ? 'bg-[var(--color-gold-500)] text-[var(--color-ink-50)] border-[var(--color-gold-500)]'
                  : 'text-[var(--color-ink-700)]',
              )}
            >
              {form.credito ? '✓' : ''}
            </button>
            <span className="text-sm text-[var(--color-ink-800)]">
              Línea de crédito habilitada
            </span>
          </label>

          <Field
            mark="04"
            label="Tope de crédito"
            error={errors.topeCredito}
            hint={form.credito ? 'S/' : 'Active crédito para definir tope'}
          >
            <Input
              type="number"
              step="0.01"
              min={0}
              value={form.topeCredito}
              onChange={(e) => set('topeCredito', e.target.value)}
              className="num"
              disabled={!form.credito}
            />
          </Field>
        </div>

        {form.credito && (
          <div className="surface p-5 reveal" style={{ animationDelay: '40ms' }}>
            <div className="flex items-baseline justify-between mb-2.5">
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                Vista previa de uso
              </p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                {fmt.percent(previewPct)} utilizado
              </p>
            </div>
            <div className="h-1.5 w-full bg-[rgba(232,230,224,0.08)] relative overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  previewPct < 50
                    ? 'bg-[var(--color-jade-500)]'
                    : previewPct < 80
                      ? 'bg-[var(--color-gold-500)]'
                      : 'bg-[var(--color-cinnabar-500)]',
                )}
                style={{ width: `${previewPct}%` }}
              />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <p className="mark text-[0.5rem]">
                Saldo actual: {fmt.money(previewSaldo)}
              </p>
              <p className="mark text-[0.5rem]">
                Tope: {fmt.money(tope)}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-5">
        <header className="flex items-baseline gap-3">
          <span className="mark text-[0.55rem]">§ III</span>
          <h3 className="display text-lg text-[var(--color-ink-900)]">Personal</h3>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          <Field mark="05" label="Tipo de cliente" required>
            <Select
              value={form.TipoCliente}
              onChange={(e) => set('TipoCliente', e.target.value as FormState['TipoCliente'])}
            >
              {Object.entries(TIPO_CLIENTE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            mark="06"
            label="Género"
          >
            <Select
              value={form.genero}
              onChange={(e) => set('genero', e.target.value as 'M' | 'F')}
            >
              {Object.entries(GENERO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            mark="07"
            label="Representante"
            required
            error={errors.idRepresentante}
            hint="ID personal asignado"
          >
            <Input
              type="number"
              min={1}
              value={form.idRepresentante}
              onChange={(e) => set('idRepresentante', e.target.value)}
              className="num"
            />
          </Field>
        </div>

        {mode === 'edit' && (
          <Field
            mark="08"
            label="Calificación"
            hint="Solo el sistema asigna (A, B, C)"
          >
            <Select
              value={form.Calificacion}
              onChange={(e) => set('Calificacion', e.target.value as FormState['Calificacion'])}
            >
              <option value="">Sin calificar</option>
              <option value="A">A — Excelente</option>
              <option value="B">B — Aceptable</option>
              <option value="C">C — Riesgo</option>
            </Select>
          </Field>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <Field mark="09" label="RUC" error={errors.Ruc} hint="Opcional · 11 dígitos">
            <Input
              value={form.Ruc}
              onChange={(e) => set('Ruc', e.target.value)}
              placeholder="20123456789"
              maxLength={11}
              className="num"
            />
          </Field>

          <Field mark="10" label="Dirección" hint="Opcional">
            <Input
              value={form.Direccion}
              onChange={(e) => set('Direccion', e.target.value)}
              placeholder="Av. La Marina 123, Arequipa"
            />
          </Field>
        </div>
      </section>

      <footer className="flex items-center justify-end gap-3 pt-2 hairline-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {mode === 'create' ? 'Registrar cliente' : 'Guardar cambios'}
        </Button>
      </footer>

      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-[var(--color-ink-100)]/40 backdrop-blur-[1px] rounded-sm">
          <Spinner label="guardando" />
        </div>
      )}
    </form>
  );
}
