import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { LazyMotion, domAnimation } from "framer-motion";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Credora | Institutional Credential Verification",
  description:
    "Secure, immutable, and institutional certificate verification powered by Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body
        className={cn(
          "min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 font-sans relative",
        )}
      >
        {/* Professional Corporate Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-white">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 blur-[120px] rounded-full opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-100 blur-[120px] rounded-full opacity-60" />
        </div>

        <LazyMotion features={domAnimation}>
          <Providers>
            {children}
            <Toaster richColors position="top-right" />
          </Providers>
        </LazyMotion>
      </body>
    </html>
  );
}
