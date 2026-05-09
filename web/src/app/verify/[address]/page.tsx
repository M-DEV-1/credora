"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { solanaClient } from "@/services/solana";
import { Navbar } from "@/components/layouts/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Calendar, User, Mail, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VerifyStep = "searching" | "fetching" | "decrypting" | "ready";

function VerifyContent() {
  const params = useParams();
  const address = params.address as string;
  
  const [step, setStep] = React.useState<VerifyStep>("searching");
  const [certificate, setCertificate] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchCert() {
      if (!address) return;
      try {
        // 1. Search Chain
        setStep("searching");
        const onChain = await solanaClient.getCertificate(address);
        if (!onChain) {
          setError("No certificate found at this address.");
          return;
        }

        // 2. Fetch Database Metadata (to get real IPFS CID)
        setStep("decrypting");
        const privateResponse = await fetch(`/api/certificates/${onChain.cid}`);
        const privateMetadata = privateResponse.ok ? await privateResponse.json() : {};
        
        const realCid = privateMetadata.ipfsCid || onChain.cid;

        // 3. Fetch IPFS Public Metadata
        setStep("fetching");
        const ipfsUrl = `/api/ipfs?cid=${realCid}`;
        const publicMetaResponse = await fetch(ipfsUrl);
        if (!publicMetaResponse.ok) throw new Error("Failed to fetch public metadata.");
        const publicMetadata = await publicMetaResponse.json();

        setCertificate({ 
          onChain, 
          metadata: { ...publicMetadata, ...privateMetadata } 
        });
        setStep("ready");
      } catch (e: any) {
        console.error("Verification failed:", e);
        setError(e.message || "An unexpected error occurred during verification.");
      }
    }
    fetchCert();
  }, [address]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center space-y-6">
        <div className="p-4 rounded-full bg-red-50">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">Verification Error</h1>
          <p className="text-neutral-500 max-w-md mx-auto font-medium">{error}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (step !== "ready") {
    const stepLabels = {
      searching: "Searching Solana Blockchain...",
      fetching: "Retrieving IPFS Metadata...",
      decrypting: "Decrypting Private Proofs...",
      ready: "Verification Complete"
    };

    const stepProgress = { searching: 25, fetching: 60, decrypting: 90, ready: 100 };

    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8 w-full">
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">{stepLabels[step]}</h3>
            <span className="text-xs font-mono text-neutral-400 font-bold">{stepProgress[step]}%</span>
          </div>
          <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
            <motion.div 
              className="h-full bg-primary" 
              initial={{ width: 0 }}
              animate={{ width: `${stepProgress[step]}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 text-neutral-400 animate-pulse font-bold">
          <Loader2 className="h-5 w-5 animate-spin" />
          Securely verifying credential...
        </div>
      </div>
    );
  }

  const isRevoked = certificate.onChain.status !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`glass border-2 overflow-hidden ${isRevoked ? 'border-red-500/20 shadow-red-500/5' : 'border-emerald-500/20 shadow-emerald-500/5'}`}>
        <div className={cn(
          "h-2 w-full",
          isRevoked ? "bg-red-500" : "bg-emerald-500"
        )} />
        <CardHeader className="text-center pb-8 pt-10">
          <div className="flex justify-center mb-6">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "p-5 rounded-full shadow-inner",
                isRevoked ? "bg-red-50" : "bg-emerald-50"
              )}
            >
              {isRevoked ? (
                <ShieldAlert className="h-14 w-14 text-red-500" />
              ) : (
                <ShieldCheck className="h-14 w-14 text-emerald-500" />
              )}
            </motion.div>
          </div>
          <div className="space-y-3">
            <Badge 
              className={cn(
                "px-6 py-1 text-xs font-black uppercase tracking-[0.2em] border-none shadow-sm",
                isRevoked ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
              )}
            >
              {isRevoked ? "Revoked" : "Verified"}
            </Badge>
            <CardTitle className="text-4xl font-black text-neutral-900 tracking-tight">
              {certificate.metadata.name}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-10 p-10 bg-white/50">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <User className="h-3 w-3" /> Recipient
              </div>
              <p className="text-xl text-neutral-900 font-bold">{certificate.metadata.recipientName}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <Calendar className="h-3 w-3" /> Valid From
              </div>
              <p className="text-xl text-neutral-900 font-bold">{certificate.metadata.issueDate}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <Calendar className="h-3 w-3" /> Valid Until
              </div>
              <p className="text-xl text-neutral-900 font-bold">{certificate.metadata.expiryDate || 'No Expiry'}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <Mail className="h-3 w-3" /> Contact
              </div>
              <p className="text-xl text-neutral-900 font-bold">{certificate.metadata.recipientEmail}</p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <FileText className="h-3 w-3" /> IPFS CID
              </div>
              <a 
                href={`https://ipfs.io/ipfs/${certificate.onChain.cid}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary font-mono text-sm hover:underline truncate block"
              >
                {certificate.onChain.cid}
              </a>
            </div>
          </div>

          <div className="pt-10 border-t border-neutral-200 space-y-6">
            <div className="space-y-3">
              <h4 className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">Description</h4>
              <p className="text-neutral-600 leading-relaxed font-medium">
                {certificate.metadata.description}
              </p>
            </div>

            <div className="pt-6 space-y-3">
              <h4 className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">Solana Proof of Authenticity</h4>
              <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3 shadow-inner">
                <div className="flex justify-between items-center group cursor-pointer" onClick={() => navigator.clipboard.writeText(address)}>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Account ID</span>
                  <span className="text-xs font-mono text-neutral-500 truncate ml-4 group-hover:text-primary transition-colors">{address}</span>
                </div>
                <div className="flex justify-between items-center group cursor-pointer" onClick={() => navigator.clipboard.writeText(certificate.onChain.issuer)}>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Issuer</span>
                  <span className="text-xs font-mono text-neutral-500 truncate ml-4 group-hover:text-primary transition-colors">{certificate.onChain.issuer}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function VerifyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <div className="flex-1 mx-auto w-full max-w-3xl px-4 pt-32 pb-20">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
            <p className="mt-4 text-neutral-400 font-bold">Loading verifier...</p>
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </div>
    </main>
  );
}
