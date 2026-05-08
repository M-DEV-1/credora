"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { certificateMetadataSchema, type CertificateMetadata } from "../types";
import { useIssueCertificate } from "../hooks/useIssueCertificate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShieldCheck,
  Loader2,
  ArrowRight,
  ArrowLeft,
  PenLine,
  Fingerprint,
  CloudUpload,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "metadata" | "security" | "blockchain";

const steps: { id: Step; title: string; icon: any }[] = [
  { id: "metadata", title: "Details", icon: PenLine },
  { id: "security", title: "Security", icon: Fingerprint },
  { id: "blockchain", title: "Blockchain", icon: CloudUpload },
];

export function IssueCertificateForm() {
  const [currentStep, setCurrentStep] = React.useState<Step>("metadata");
  const { mutate: issue, isPending, isSuccess } = useIssueCertificate();

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CertificateMetadata>({
    resolver: zodResolver(certificateMetadataSchema),
    defaultValues: {
      attributes: [],
    },
  });

  React.useEffect(() => {
    setValue("issueDate", new Date().toISOString().split("T")[0]);
  }, [setValue]);

  const onNext = async () => {
    if (currentStep === "metadata") {
      const isValid = await trigger([
        "name",
        "recipientName",
        "recipientEmail",
        "description",
        "issueDate",
        "expiryDate",
      ]);
      if (isValid) setCurrentStep("security");
    }
  };

  const onSubmit = (data: CertificateMetadata) => {
    issue(data);
  };

  const stepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="relative flex justify-between px-2">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-neutral-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(stepIndex / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx <= stepIndex;
          const isCurrent = step.id === currentStep;
          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-3"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 bg-white",
                  isCurrent
                    ? "border-blue-600 text-blue-600 scale-110 shadow-lg shadow-blue-600/10 ring-4 ring-blue-600/5"
                    : isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-neutral-200 text-neutral-300",
                )}
              >
                <Icon className={cn("h-5 w-5", isCurrent && "animate-pulse")} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  isActive ? "text-neutral-900" : "text-neutral-400",
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass border-neutral-200 shadow-xl overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-neutral-100 bg-neutral-50/30 p-8">
            <CardTitle className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
              {currentStep === "metadata" && "Credential Details"}
              {currentStep === "security" && "Privacy & Auth"}
              {currentStep === "blockchain" && "Finalize Issuance"}
            </CardTitle>
            <CardDescription className="text-neutral-500 font-medium">
              {currentStep === "metadata" &&
                "Define the core information for this certificate."}
              {currentStep === "security" &&
                "Authorized encryption of PII data for the recipient."}
              {currentStep === "blockchain" &&
                "Mint the verifiable record to the Solana ledger."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                {currentStep === "metadata" && (
                  <motion.div
                    key="metadata"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-neutral-900 font-bold uppercase tracking-wider text-[11px]"
                        >
                          Certificate Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g. MS in Data Science"
                          className="h-11 bg-white border-neutral-200"
                          {...register("name")}
                        />
                        {errors.name && (
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="recipientName"
                          className="text-neutral-900 font-bold uppercase tracking-wider text-[11px]"
                        >
                          Recipient Full Name
                        </Label>
                        <Input
                          id="recipientName"
                          placeholder="John Doe"
                          className="h-11 bg-white border-neutral-200"
                          {...register("recipientName")}
                        />
                        {errors.recipientName && (
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                            {errors.recipientName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="recipientEmail"
                        className="text-neutral-900 font-bold uppercase tracking-wider text-[11px]"
                      >
                        Recipient Email (Encrypted)
                      </Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        placeholder="john.doe@example.com"
                        className="h-11 bg-white border-neutral-200"
                        {...register("recipientEmail")}
                      />
                      {errors.recipientEmail && (
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                          {errors.recipientEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="issueDate"
                          className="text-neutral-900 font-bold uppercase tracking-wider text-[11px]"
                        >
                          Issue Date
                        </Label>
                        <Input
                          id="issueDate"
                          type="date"
                          className="h-11 bg-white border-neutral-200"
                          {...register("issueDate")}
                        />
                        {errors.issueDate && (
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                            {errors.issueDate.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="expiryDate"
                          className="text-neutral-900 font-bold uppercase tracking-wider text-[11px]"
                        >
                          Expiry Date (Optional)
                        </Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          className="h-11 bg-white border-neutral-200"
                          {...register("expiryDate")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-neutral-900 font-bold uppercase tracking-wider text-[11px]"
                      >
                        Credential Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Detailed description of the achievement..."
                        className="min-h-[100px] bg-white border-neutral-200"
                        {...register("description")}
                      />
                      {errors.description && (
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={onNext}
                      className="w-full h-12 font-black uppercase tracking-widest text-xs bg-[#002147] hover:bg-[#003366] text-white rounded-md"
                    >
                      Continue to Security{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {currentStep === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 py-4"
                  >
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                      <h4 className="font-black text-primary flex items-center gap-3 uppercase tracking-widest text-sm">
                        <Fingerprint className="h-6 w-6" /> Privacy Protocol
                      </h4>
                      <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                        Recipient data (Name/Email) will be{" "}
                        <strong>encrypted with AES-256-GCM</strong>. Only
                        authorized entities with the decryption key can view
                        these details. You must sign an authorization with your
                        wallet to proceed.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setCurrentStep("metadata")}
                        className="h-12 font-black uppercase tracking-widest text-xs"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setCurrentStep("blockchain")}
                        className="h-12 font-black uppercase tracking-widest text-xs bg-[#002147] hover:bg-[#003366] text-white rounded-md"
                      >
                        Authorize <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {currentStep === "blockchain" && (
                  <motion.div
                    key="blockchain"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 py-4"
                  >
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <CloudUpload className="h-8 w-8 text-primary animate-bounce" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-neutral-900">
                          Ready for Launch
                        </h3>
                        <p className="text-sm text-neutral-500">
                          Confirming metadata:{" "}
                          <span className="font-medium text-neutral-900">
                            {getValues("name")}
                          </span>{" "}
                          for{" "}
                          <span className="font-medium text-neutral-900">
                            {getValues("recipientName")}
                          </span>
                          .
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Button
                        variant="outline"
                        type="button"
                        disabled={isPending}
                        onClick={() => setCurrentStep("security")}
                        className="h-11"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="h-12 font-black uppercase tracking-widest text-xs bg-[#002147] hover:bg-[#003366] text-white rounded-md"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Sign & Issue"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
