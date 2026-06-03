import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { Spinner } from '@/components/common/Spinner';
import { clientesService } from '@/services/clientes.service';
import type {
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
} from '@/types/cliente.types';
import { fmt } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/helpers';

export default function ClienteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [fetching, setFetching] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial del cliente en edición
  if (isEdit && id && !cliente && !error && fetching) {
    clientesService
      .getById(id)
      .then((c) => {
        setCliente(c);
        setFetching(false);
      })
      .catch((e) => {
        setError(getErrorMessage(e));
        setFetching(false);
      });
  }

  async function onSubmit(payload: CreateClienteDTO | UpdateClienteDTO) {
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && id) {
        const res = await clientesService.update(id, payload as UpdateClienteDTO);
        if (!res) throw new Error('No se pudo guardar');
      } else {
        const res = await clientesService.create(payload as CreateClienteDTO);
        if (!res) throw new Error('No se pudo registrar');
      }
      navigate('/clientes', { replace: true });
      return { ok: true };
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      setSubmitting(false);
      return { ok: false, error: msg };
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center gap-3 text-[var(--color-ink-700)]">
        <Spinner label="cargando cliente" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl reveal">
      <header className="mb-10">
        <p className="mark text-[0.55rem]">
          {isEdit ? '§ 03 — Edición' : '§ 03 — Registro'}
        </p>
        <h2 className="display text-4xl text-[var(--color-ink-900)] mt-2 tracking-tight">
          {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
        </h2>
        <p className="text-sm text-[var(--color-ink-700)] mt-2 max-w-xl">
          {isEdit
            ? 'Modifique datos de identificación, contacto o línea de crédito. El código y la zona son inmutables.'
            : 'Registre un cliente en la cartera maestra. Tenga en cuenta que las líneas de crédito se evalúan por separado.'}
        </p>
      </header>

      <div className="surface p-8 md:p-12 relative">
        {isEdit && cliente && (
          <div className="absolute top-6 right-8 text-right space-y-0.5">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Código
            </p>
            <p className="num text-lg text-[var(--color-gold-500)] tracking-[0.15em]">
              {cliente.Cliente}
            </p>
            {cliente.Saldo > 0 && (
              <p className="mark text-[0.5rem] text-[var(--color-ink-700)]">
                Saldo {fmt.money(cliente.Saldo)}
              </p>
            )}
          </div>
        )}

        <ClienteForm
          mode={isEdit ? 'edit' : 'create'}
          initial={cliente}
          loading={submitting}
          error={error}
          onSubmit={onSubmit}
          onCancel={() => navigate('/clientes')}
        />
      </div>
    </div>
  );
}
