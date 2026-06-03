import { useRef, useState, type FormEvent } from 'react';
import { Field, Input, Select } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { MEDIDAS } from '@/utils/constants';
import {
  required,
  isPositive,
  isNonNegative,
  maxLen,
  minLen,
} from '@/utils/validators';
import { cn } from '@/utils/helpers';
import type {
  CreateProductoDTO,
  Producto,
  UpdateProductoDTO,
} from '@/types/producto.types';

interface ProductoFormProps {
  initial?: Producto | null;
  loading?: boolean;
  error?: string | null;
  onSubmit: (
    payload: CreateProductoDTO | UpdateProductoDTO,
  ) => Promise<{ ok: boolean; error?: string }>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

interface FormState {
  Producto: string;
  Marca: string;
  Descripcion: string;
  StockAc: string;
  StockMin: string;
  StockMax: string;
  PrecCosto: string;
  PrecVenta: string;
  Peso: string;
  ConIgv: boolean;
  UniMed: string;
}

const empty: FormState = {
  Producto: '',
  Marca: '',
  Descripcion: '',
  StockAc: '0',
  StockMin: '0',
  StockMax: '0',
  PrecCosto: '0',
  PrecVenta: '0',
  Peso: '0',
  ConIgv: true,
  UniMed: 'UNIDAD',
};

function fromProducto(p?: Producto | null): FormState {
  if (!p) return empty;
  return {
    Producto: p.Producto,
    Marca: p.Marca,
    Descripcion: p.Descripcion,
    StockAc: String(p.StockAc),
    StockMin: String(p.StockMin),
    StockMax: String(p.StockMax),
    PrecCosto: String(p.PrecCosto),
    PrecVenta: String(p.PrecVenta),
    Peso: String(p.Peso),
    ConIgv: p.ConIgv,
    UniMed: p.UniMed,
  };
}

export function ProductoForm({
  initial,
  loading = false,
  error = null,
  onSubmit,
  onCancel,
  mode,
}: ProductoFormProps) {
  const [form, setForm] = useState<FormState>(() => fromProducto(initial));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const lastKey = useRef(initial?.Producto);

  // React 19 pattern: ajustar estado cuando cambia un prop, sin useEffect
  if (initial?.Producto !== lastKey.current) {
    lastKey.current = initial?.Producto;
    setForm(fromProducto(initial));
    setErrors({});
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (mode === 'create') {
      if (!required(form.Producto) || !minLen(4)(form.Producto) || !maxLen(4)(form.Producto))
        e.Producto = 'SKU de 4 caracteres';
      if (!required(form.Marca) || !minLen(2)(form.Marca) || !maxLen(2)(form.Marca))
        e.Marca = 'Marca de 2 caracteres';
    }
    if (!required(form.Descripcion) || !maxLen(200)(form.Descripcion))
      e.Descripcion = 'Descripción requerida (máx. 200)';
    if (!isNonNegative(form.StockAc)) e.StockAc = 'Debe ser ≥ 0';
    if (!isNonNegative(form.StockMin)) e.StockMin = 'Debe ser ≥ 0';
    if (!isNonNegative(form.StockMax)) e.StockMax = 'Debe ser ≥ 0';
    if (!isPositive(form.PrecCosto)) e.PrecCosto = 'Requerido';
    if (!isPositive(form.PrecVenta)) e.PrecVenta = 'Requerido';
    if (Number(form.StockMax) > 0 && Number(form.StockMin) > Number(form.StockMax))
      e.StockMax = 'Stock máx. debe ser ≥ stock mín.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!validate()) return;
    const payload: CreateProductoDTO = {
      Producto: form.Producto.toUpperCase(),
      Marca: form.Marca.toUpperCase(),
      Descripcion: form.Descripcion,
      StockAc: Number(form.StockAc),
      StockMin: Number(form.StockMin),
      StockMax: Number(form.StockMax),
      PrecCosto: Number(form.PrecCosto),
      PrecVenta: Number(form.PrecVenta),
      Peso: Number(form.Peso),
      ConIgv: form.ConIgv,
      UniMed: form.UniMed,
    };
    const result = await onSubmit(payload);
    if (!result.ok && result.error) {
      setErrors({ Producto: result.error });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 relative">
      {error && <Alert tone="cinnabar">{error}</Alert>}

      <section className="space-y-5">
        <header className="flex items-baseline gap-3">
          <span className="mark text-[0.55rem]">§ I</span>
          <h3 className="display text-lg text-[var(--color-ink-900)]">Identidad</h3>
        </header>

        <div className="grid gap-5 md:grid-cols-[120px_120px_1fr]">
          <Field
            mark="01"
            label="SKU"
            required
            error={errors.Producto}
            hint={mode === 'edit' ? 'Inmutable' : '4 caracteres'}
          >
            <Input
              value={form.Producto}
              onChange={(e) => set('Producto', e.target.value)}
              placeholder="PR01"
              maxLength={4}
              disabled={mode === 'edit'}
              className="num uppercase tracking-wider"
            />
          </Field>

          <Field
            mark="02"
            label="Marca"
            required
            error={errors.Marca}
            hint={mode === 'edit' ? 'Inmutable' : '2 caracteres'}
          >
            <Input
              value={form.Marca}
              onChange={(e) => set('Marca', e.target.value)}
              placeholder="SA"
              maxLength={2}
              disabled={mode === 'edit'}
              className="num uppercase"
            />
          </Field>

          <Field
            mark="03"
            label="Descripción"
            required
            error={errors.Descripcion}
          >
            <Input
              value={form.Descripcion}
              onChange={(e) => set('Descripcion', e.target.value)}
              placeholder="Samsung Galaxy S23"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-5">
        <header className="flex items-baseline gap-3">
          <span className="mark text-[0.55rem]">§ II</span>
          <h3 className="display text-lg text-[var(--color-ink-900)]">Inventario</h3>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          <Field mark="04" label="Stock actual" error={errors.StockAc}>
            <Input
              type="number"
              min={0}
              value={form.StockAc}
              onChange={(e) => set('StockAc', e.target.value)}
              className="num"
            />
          </Field>
          <Field mark="05" label="Stock mínimo" error={errors.StockMin}>
            <Input
              type="number"
              min={0}
              value={form.StockMin}
              onChange={(e) => set('StockMin', e.target.value)}
              className="num"
            />
          </Field>
          <Field mark="06" label="Stock máximo" error={errors.StockMax}>
            <Input
              type="number"
              min={0}
              value={form.StockMax}
              onChange={(e) => set('StockMax', e.target.value)}
              className="num"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-5">
        <header className="flex items-baseline gap-3">
          <span className="mark text-[0.55rem]">§ III</span>
          <h3 className="display text-lg text-[var(--color-ink-900)]">Comercial</h3>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          <Field mark="07" label="Precio costo" required error={errors.PrecCosto}>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={form.PrecCosto}
              onChange={(e) => set('PrecCosto', e.target.value)}
              className="num"
            />
          </Field>
          <Field mark="08" label="Precio venta" required error={errors.PrecVenta}>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={form.PrecVenta}
              onChange={(e) => set('PrecVenta', e.target.value)}
              className="num"
            />
          </Field>
          <Field mark="09" label="Peso (kg)">
            <Input
              type="number"
              step="0.001"
              min={0}
              value={form.Peso}
              onChange={(e) => set('Peso', e.target.value)}
              className="num"
            />
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_1fr_auto]">
          <Field mark="10" label="Unidad de medida">
            <Select
              value={form.UniMed}
              onChange={(e) => set('UniMed', e.target.value)}
            >
              {MEDIDAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>

          <label className="flex items-end pb-2.5 gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => set('ConIgv', !form.ConIgv)}
              className={cn(
                'h-10 w-10 grid place-items-center hairline transition-all',
                form.ConIgv
                  ? 'bg-[var(--color-gold-500)] text-[var(--color-ink-50)] border-[var(--color-gold-500)]'
                  : 'text-[var(--color-ink-700)]',
              )}
            >
              {form.ConIgv ? '✓' : ''}
            </button>
            <span className="text-sm text-[var(--color-ink-800)]">
              Precio incluye IGV
            </span>
          </label>
        </div>
      </section>

      <footer className="flex items-center justify-end gap-3 pt-2 hairline-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {mode === 'create' ? 'Registrar producto' : 'Guardar cambios'}
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
