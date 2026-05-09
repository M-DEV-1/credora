"use client";

import { useCertificates } from "../hooks/useCertificates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  MoreVertical,
  Trash2,
  ExternalLink,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { m } from "framer-motion";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRevokeCertificate } from "../hooks/useRevokeCertificate";
import { toast } from "sonner";

export function CertificateList() {
  const { data: certificates, isLoading } = useCertificates();
  const { mutate: revoke, isPending: isRevoking } = useRevokeCertificate();

  const copyToClipboard = (address: string) => {
    const url = `${window.location.origin}/verify/${address}`;
    navigator.clipboard.writeText(url);
    toast.success("Verification link copied!");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-neutral-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-primary" />
          <p className="text-sm font-medium">Loading credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl border border-neutral-200 overflow-hidden shadow-sm"
    >
      <Table>
        <TableHeader className="bg-neutral-50/50">
          <TableRow className="border-neutral-100 hover:bg-transparent">
            <TableHead className="text-neutral-500 font-bold uppercase tracking-wider text-xs">
              Certificate
            </TableHead>
            <TableHead className="text-neutral-500 font-bold uppercase tracking-wider text-xs">
              Recipient
            </TableHead>
            <TableHead className="text-neutral-500 font-bold uppercase tracking-wider text-xs">
              Valid From
            </TableHead>
            <TableHead className="text-neutral-500 font-bold uppercase tracking-wider text-xs">
              Valid Until
            </TableHead>
            <TableHead className="text-neutral-500 font-bold uppercase tracking-wider text-xs">
              Status
            </TableHead>
            <TableHead className="text-right text-neutral-500 font-bold uppercase tracking-wider text-xs">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certificates?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-32 text-center text-neutral-500 font-medium"
              >
                No certificates issued yet.
              </TableCell>
            </TableRow>
          ) : (
            certificates?.map((cert) => (
              <TableRow
                key={cert.pubkey}
                className="border-neutral-100 hover:bg-neutral-50/50 transition-colors"
              >
                <TableCell className="font-medium text-neutral-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {cert.metadata?.name ||
                      `Certificate ${cert.pubkey.slice(0, 4)}...`}
                  </div>
                </TableCell>
                <TableCell className="text-neutral-600 font-medium">
                  {cert.metadata?.recipientName || "Unknown"}
                </TableCell>
                <TableCell className="text-neutral-600 font-medium">
                  {cert.metadata?.issueDate || "Unknown"}
                </TableCell>
                <TableCell className="text-neutral-600 font-medium">
                  {cert.metadata?.expiryDate || "No Expiry"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      cert.onChainData.status === 0
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm font-bold tracking-wider"
                        : "bg-red-50 text-red-600 border-red-200 shadow-sm font-bold tracking-wider"
                    }
                  >
                    {cert.onChainData.status === 0 ? "ACTIVE" : "REVOKED"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "hover:bg-neutral-100 text-neutral-500"
                        )}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white border-neutral-200 text-neutral-700 shadow-xl rounded-xl"
                      >
                        <DropdownMenuItem>
                          <Link
                            href={`/verify/${cert.pubkey}`}
                            className="flex items-center gap-2 cursor-pointer font-medium hover:text-primary"
                          >
                            <CheckCircle2 className="h-4 w-4" /> View
                            Verification
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(cert.pubkey)}
                          className="flex items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-neutral-50 transition-colors"
                        >
                          <Copy className="h-4 w-4" /> Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <a
                            href={`https://explorer.solana.com/address/${cert.pubkey}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 w-full font-medium hover:text-primary"
                          >
                            <ExternalLink className="h-4 w-4" /> View on
                            Explorer
                          </a>
                        </DropdownMenuItem>

                        {cert.onChainData.status === 0 && (
                          <>
                            <DropdownMenuSeparator className="bg-neutral-100" />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700 focus:bg-red-50 flex items-center gap-2 cursor-pointer font-bold"
                              onClick={() =>
                                revoke({
                                  pda: cert.pubkey,
                                  cid: cert.onChainData.cid,
                                })
                              }
                              disabled={isRevoking}
                            >
                              <Trash2 className="h-4 w-4" /> Revoke Certificate
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </m.div>
  );
}
