import { IssueCertificateForm } from "@/features/certificates/components/IssueCertificateForm";
import { Navbar } from "@/components/layouts/Navbar";
import { WalletGuard } from "@/components/WalletGuard";

export default function IssuePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <WalletGuard>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-20">
          <div className="w-full max-w-2xl">
            <IssueCertificateForm />
          </div>
        </div>
      </WalletGuard>
    </main>
  );
}
