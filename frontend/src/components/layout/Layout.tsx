import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen flex bg-[var(--color-ink-50)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-8 lg:px-12 py-10 max-w-[1600px] w-full">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
