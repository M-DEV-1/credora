"use client";

import { Navbar } from "@/components/layouts/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, FileCheck2, Landmark, History } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden relative">
      <Navbar />

      {/* Hero Section - Institutional Grade */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 pt-32 pb-20 text-center sm:px-6 lg:px-8 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-8">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-800" />
            Institutional Grade Security
          </div>
          
          <h1 className="text-6xl font-serif font-medium tracking-tight sm:text-8xl text-slate-900 leading-[1.1]">
            The Standard for <br />
            <span className="text-[#B8860B]">Digital Credentials</span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl font-light leading-relaxed text-slate-600">
            Secure, immutable, and cryptographically verifiable academic and professional 
            records anchored on the Solana blockchain. Engineered for the modern institution.
          </p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6"
          >
            <Link href="/issue">
              <Button
                size="lg"
                className="h-14 px-10 text-base font-semibold bg-[#002147] hover:bg-[#003366] text-white rounded-md shadow-lg transition-all duration-200"
              >
                Issue Certificate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/verify">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-base font-semibold text-[#002147] border-slate-200 hover:bg-slate-50 rounded-md transition-all duration-200"
              >
                Verify Record
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Institutional Features */}
        <div className="mt-32 grid w-full max-w-6xl grid-cols-1 gap-12 sm:grid-cols-3 relative z-10">
          {[
            {
              title: "Immutable Ledger",
              description:
                "Every credential is anchored on-chain, providing a permanent and tamper-proof audit trail.",
              icon: Landmark,
            },
            {
              title: "Distributed Storage",
              description:
                "Metadata is persisted via IPFS, ensuring long-term accessibility without central points of failure.",
              icon: FileCheck2,
            },
            {
              title: "Instant Verification",
              description:
                "Cryptographic proofs allow immediate validation by employers and institutions globally.",
              icon: History,
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="mb-6 p-4 rounded-xl bg-white border border-slate-100 shadow-sm group-hover:border-[#B8860B]/30 transition-colors duration-300">
                <feature.icon className="h-8 w-8 text-slate-800" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm font-light">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/60 py-12 px-4 sm:px-6 lg:px-8 bg-white relative z-20">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002147] rounded flex items-center justify-center text-white font-serif font-bold text-lg">C</div>
            <span className="text-sm font-bold tracking-tighter text-slate-900 uppercase">Credora</span>
          </div>
          <div className="text-xs font-medium text-slate-400">
            © 2026 Credora Systems. All Rights Reserved.
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-600 uppercase tracking-widest">
            <Link href="https://x.com/mdev_1" className="hover:text-[#B8860B] transition-colors">Network</Link>
            <Link href="https://github.com/M-DEV-1/credora" className="hover:text-[#B8860B] transition-colors">Repository</Link>
            <Link href="/docs" className="hover:text-[#B8860B] transition-colors">Documentation</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

