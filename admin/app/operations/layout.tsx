import { Sidebar } from '@/components/shared/sidebar';
import { Header } from '@/components/shared/header';
import { AuthProvider } from '@/providers/auth-provider';

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-slate-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
