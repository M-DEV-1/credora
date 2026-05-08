import { z } from "zod";

export const certificateMetadataSchema = z.object({
  name: z.string().min(2, "Certificate name is required"),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientEmail: z.string().email("Invalid email address"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.string(),
  })),
});

export type CertificateMetadata = z.infer<typeof certificateMetadataSchema>;
