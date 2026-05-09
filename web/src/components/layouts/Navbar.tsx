"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMounted } from "@/hooks/useMounted";

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton,
    ),
  { ssr: false },
);

export function Navbar() {
  const mounted = useMounted();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-neutral-200 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#002147] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-neutral-900">
            Credora
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/verify"
            className="text-sm font-bold text-neutral-600 transition-colors hover:text-blue-600"
          >
            Verify
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-bold text-neutral-600 transition-colors hover:text-blue-600"
          >
            Dashboard
          </Link>

          {mounted && <WalletMultiButton />}
        </div>
      </div>
    </nav>
  );
}
