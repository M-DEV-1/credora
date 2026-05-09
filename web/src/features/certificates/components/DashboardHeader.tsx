"use client";

import { m } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <m.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10"
    >      <div>
        <h1 className="text-4xl font-black tracking-tight text-neutral-900">
          Dashboard
        </h1>
        <p className="mt-2 text-neutral-500 font-medium">
          Manage your issued credentials and track their status.
        </p>
      </div>

      <Link href="/issue">
        <Button
          size="lg"
          className="h-14 px-8 font-black uppercase tracking-widest text-xs bg-[#002147] hover:bg-[#003366] text-white rounded-md shadow-lg shadow-blue-600/20 hover:shadow-xl transition-all active:scale-95 duration-300 rounded-2xl"
        >
          <Plus className="mr-2 h-5 w-5" />
          Issue New
        </Button>
      </Link>
    </m.div>
  );
}
