import { Navbar } from "@/components/layouts/Navbar";
import { ShieldCheck } from "lucide-react";
import { VerifySearchForm } from "@/features/certificates/components/VerifySearchForm";

export default function VerifySearchPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-20">
        <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="h-8 w-8 text-neutral-900" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 mb-4">
              Verify a Credential
            </h1>
            <p className="text-lg text-neutral-500 font-medium max-w-lg mx-auto leading-relaxed">
              Enter a Solana certificate address to verify its authenticity and
              view the credential details on-chain.
            </p>
          </div>

          <VerifySearchForm />
        </div>
      </div>
    </main>
  );
}
