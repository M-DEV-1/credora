"use client";

import React from "react";

export function SolanaWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
