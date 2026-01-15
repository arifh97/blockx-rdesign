'use client';

import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { useTokenRefresh } from '@/hooks/use-token-refresh';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = useTokenRefresh();

  // Show loading state while checking authentication
  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative">
      <img className='absolute top-0 right-0 w-[60%] h-auto -z-1' src="body-shap1.svg" alt="" />      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      <img  className="body-shap2 absolute bottom-0 left-0 w-[40%] h-[60%] -z-1" src="body-shap2.svg" alt="" />
      <img  className="body-shap3 absolute bottom-0 right-0 w-[20%] h-full -z-1" src="body-shap3.svg" alt="" />
    </div>
  );
}
