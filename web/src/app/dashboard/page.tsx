import { CertificateList } from "@/features/certificates/components/CertificateList";
import { Navbar } from "@/components/layouts/Navbar";
import { DashboardHeader } from "@/features/certificates/components/DashboardHeader";
import { WalletGuard } from "@/components/WalletGuard";

export const unstable_instant = { prefetch: 'static' };

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      
      <WalletGuard>
        <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <DashboardHeader />
          
          <div className="mt-8">
            <CertificateList />
          </div>
        </div>
      </WalletGuard>
    </main>
  );
}
