"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function VerifySearchForm() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      router.push(`/verify/${address.trim()}`);
    }
  };

  return (
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
  );
}
