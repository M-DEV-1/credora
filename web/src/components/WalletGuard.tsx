"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";

export function WalletGuard({ children }: { children: React.ReactNode }) {
  const { connected } = useWallet();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  if (connected) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full glass p-8 rounded-3xl border border-neutral-200/60 shadow-sm text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="h-8 w-8 text-neutral-900" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">
          Wallet Required
        </h2>
        <p className="text-neutral-500 mb-8 font-medium leading-relaxed">
          Please connect your Solana wallet to access this secure area.
        </p>

        <div className="flex justify-center">
          <WalletMultiButton />
        </div>
      </div>
    </div>
  );
}
