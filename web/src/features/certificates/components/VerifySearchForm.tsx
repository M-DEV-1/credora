"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";

export function VerifySearchForm() {
  const [address, setAddress] = React.useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      router.push(`/verify/${address.trim()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
          <Search className="h-5 w-5" />
        </div>
        <Input
          placeholder="Paste Solana Certificate Address..."
          className="h-16 pl-12 pr-4 text-lg bg-white border-neutral-200 focus:ring-primary/20 rounded-2xl shadow-sm transition-all"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-14 text-lg font-bold bg-[#002147] hover:bg-[#003366] text-white rounded-2xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
        disabled={!address.trim()}
      >
        Verify Authenticity
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
}
