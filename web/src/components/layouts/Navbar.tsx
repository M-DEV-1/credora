"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useMounted } from "@/hooks/useMounted";

import { useWallets } from "@wallet-standard/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const mounted = useMounted();
  const wallets = useWallets();

  // Find first connected account
  const connectedWallet = wallets.find((w) => w.accounts.length > 0);
  const activeAccount = connectedWallet?.accounts[0];

  const connect = async (wallet: any) => {
    try {
      const feature = wallet.features["standard:connect"];
      if (feature) await feature.connect();
    } catch (e) {
      console.error("Connect failed", e);
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-neutral-200 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#002147] hover:bg-[#003366] text-white rounded-md">
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

          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="outline"
                  className="gap-2 font-bold border-neutral-200 text-neutral-700"
                >
                  <Wallet className="h-4 w-4" />
                  {activeAccount ? (
                    <span className="font-mono">
                      {activeAccount.address.slice(0, 4)}...
                      {activeAccount.address.slice(-4)}
                    </span>
                  ) : (
                    "Connect"
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white border-neutral-200 shadow-xl rounded-xl p-2"
              >
                {wallets.length === 0 ? (
                  <div className="p-2 text-xs text-neutral-400 text-center">
                    No wallets found
                  </div>
                ) : (
                  wallets.map((wallet) => (
                    <DropdownMenuItem
                      key={wallet.name}
                      className="flex items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-neutral-50 transition-colors"
                      onClick={() => connect(wallet)}
                    >
                      <Image
                        src={wallet.icon}
                        alt={wallet.name}
                        className="h-5 w-5"
                      />
                      <span className="font-bold text-sm text-neutral-900">
                        {wallet.name}
                      </span>
                      {wallet.accounts.length > 0 && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
