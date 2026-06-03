export function Footer() {
  return (
    <footer className="hairline-t px-8 lg:px-12 py-5 mt-auto">
      <div className="flex items-center justify-between text-[0.65rem] text-[var(--color-ink-600)]">
        <span className="mark">¶ Tenebrosa — Sistema de Gestión</span>
        <span className="num">
          © {new Date().getFullYear()} · Ciclo VII
        </span>
      </div>
    </footer>
  );
}
