"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck } from "lucide-react";

export default function VerifySearchPage() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      router.push(`/verify/${address.trim()}`);
    }
  };

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

          <form
            onSubmit={handleSearch}
            className="glass p-8 rounded-3xl border border-neutral-200/60 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="e.g. 3E54iG2zYvMryNQHm9rBEcu9JxEyvsXsss9MjW6ZgapW"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-12 h-14 bg-white border-neutral-200 text-neutral-900 rounded-xl focus-visible:ring-neutral-900 text-base"
                  required
                />
              </div>
              <Button
                type="submit"
                className="h-14 px-8 bg-[#002147] hover:bg-[#003366] text-white rounded-md font-semibold rounded-xl text-base cursor-pointer transition-all active:scale-95 shadow-md"
              >
                Verify Now
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
