import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-8">
      <div className="text-center reveal">
        <p className="mark text-[0.6rem]">§ 404</p>
        <p className="num text-[8rem] leading-none text-[var(--color-gold-500)] my-4">
          404
        </p>
        <h1 className="display text-3xl text-[var(--color-ink-900)]">
          Página no encontrada
        </h1>
        <p className="text-sm text-[var(--color-ink-700)] mt-3 max-w-sm mx-auto">
          La ruta solicitada no existe o fue retirada del archivo.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button variant="primary">Volver al panel</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
