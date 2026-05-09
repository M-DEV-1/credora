# Credora

![Credora Preview](./public/image.png)

Credora is an institutional platform for issuing, managing, and verifying digital credentials securely on the Solana blockchain. It combines the immutability of decentralized ledgers with off-chain IPFS storage to provide tamper-proof academic and professional records.

## Demo

<video src="./public/credora-demo.mp4" controls="controls" muted="muted" width="100%"></video>

## Features

- **Immutable Records**: Certificates are anchored on the Solana blockchain, ensuring they cannot be forged or altered.
- **Decentralized Storage**: Public metadata is stored securely on IPFS via Pinata.
- **Privacy First**: Personally Identifiable Information (PII) is encrypted and stored securely off-chain, accessible only to authorized viewers via cryptographic signatures.
- **Instant Verification**: Anyone can verify the authenticity of a credential in seconds using the public verification portal.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Framer Motion
- **Blockchain**: Solana (Rust), `@solana/web3.js`, `@solana/kit`
- **Storage**: IPFS (Pinata), MongoDB

## Getting Started

### Prerequisites

- Node.js v18+
- A Solana Wallet (e.g., Phantom)

### Local Setup

1. **Clone the repository and navigate to the web directory:**

   ```bash
   git clone https://github.com/M-DEV-1/credora.git
   cd credora/web
   npm install
   ```

2. **Configure environment variables:**
   Copy the example configuration and fill in your Pinata and MongoDB keys:

   ```bash
   cp .env.example .env
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

## Solana Program Details

- **Program Name:** `credora-program`
- **Program ID:** `DDEnuH23zPBLZdEaeSYCckcv5EsTP2zRLP6a2J36rzxM`
- **Network:** Solana Devnet
- **Deployment Signature:** `5x4D5mkzyG6rb1hCcfxZGvEDMTiJaPE45AraXsMTy7ZKk4eHi6geKfSDL7Wm1NNqgC7GB71rFN1eRjkMi54FE3sX`
- **Status:** DEPLOYED
