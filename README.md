# Password Split

<p align="center">
  <img src="public/logo.webp" alt="Password Split Logo" width="160" />
</p>

Split and reconstruct your most sensitive passwords locally in the browser using Shamir’s Secret Sharing. Client‑side only: your passwords never leave your device.

## Overview

Password Split encrypts your password with AES‑GCM and splits only the encryption key into pieces (t‑of‑n). Any `t` parts can reconstruct the key and decrypt the password; fewer than `t` parts reveal nothing.

- Client‑side crypto with WebCrypto (AES‑GCM 256)
- Shamir’s Secret Sharing for threshold recovery
- Download parts as TXT or print‑friendly PDF
- Reconstruct by pasting or uploading TXT files
- Optional description stored in metadata for context
- Dark/light UI, responsive, accessible

## Planned Features

- Email notifications to regularly check recoverability of the key
- Steganography support for hiding splits in images
- Constant maintenance and security updates
- Cover hosting and development costs

Demo: try with the sample password `MyPassword123` without a license. For custom passwords, the app uses a short‑lived license ($2 for 20 minutes) purchased in‑app via Stripe.

## How It Works

1. Split

- Generate a random AES‑GCM key + IV in the browser
- Encrypt the password; keep only the ciphertext + IV
- Split the AES key into `n` shares with threshold `t`
- Each part contains: metadata (schemeId, createdAt, totalParts, threshold, IV, encryptedSecret) + that part’s key share

2. Reconstruct

- Validate parts belong to the same scheme and are unique
- Combine `t` shares to recover the AES key
- Decrypt the ciphertext locally to reveal the password

## Security Model

- All crypto and verification happen in your browser; no password or shares are sent to any server.
- License keys are verified client‑side using RS512 and an embedded public key.
- Network calls only occur for purchasing a license and retrieving a Stripe publishable key.
- If you lose enough parts to fall below the threshold, recovery is impossible by design.
- Store parts separately and securely; never keep all parts together.

## Tech Stack

- Astro + React + TypeScript
- Tailwind CSS for styling
- Zustand for state management
- WebCrypto API (AES‑GCM) + `shamir-secret-sharing`
- Lucide icons

## Requirements

- Node.js 18+ (recommended for Astro 5)
- Yarn, pnpm, or npm

## Getting Started

Install dependencies:

- Yarn: `yarn`
- pnpm: `pnpm install`
- npm: `npm install`

Run locally:

- `yarn dev` (http://localhost:4321)

Build and preview:

- Build: `yarn build` (outputs to `dist/`)
- Preview: `yarn preview`

Format code:

- `yarn format`

## Testing

- `yarn test` (Vitest)

## Deployment

This project is configured to deploy static assets with Cloudflare using Wrangler.

- Build: `yarn build`
- Deploy: `wrangler deploy` (or `yarn release` which runs build + deploy)

See `wrangler.toml` for configuration (assets directory: `./dist`). Ensure Wrangler is authenticated with your Cloudflare account.

## Project Structure

```text
/
├── public/                      # Static assets
├── src/
│   ├── backend/                 # Stripe + checkout helpers
│   ├── components/
│   │   ├── astro/               # Astro UI sections
│   │   └── react/               # React components & stores
│   ├── content/                 # Blog content (Markdown)
│   ├── pages/                   # Astro pages & routes
│   ├── ssss/                    # Shamir + crypto utils & tests
│   └── styles/                  # Global styles
├── wrangler.toml                # Cloudflare deploy config
├── tailwind.config.mjs          # Tailwind setup
├── astro.config.mjs             # Astro setup
└── package.json
```

## Notable Files

- `src/ssss/shamir.tsx` — Split/reconstruct with AES‑GCM + Shamir
- `src/components/react/Splitter.tsx` — Generate and download parts
- `src/components/react/Reconstructor.tsx` — Add parts and reconstruct
- `src/ssss/jwt.tsx` — RS512 license verification (public‑key only)

## License

PolyForm Shield License 1.0.0 — permits use and changes but restricts providing competing products. Read the full text in `LICENSE` or at https://polyformproject.org/licenses/shield/1.0.0.

## Support & Contact

Questions or issues: support@passwordsplit.com

## Disclaimer

This software is provided “as is”, without warranties. Use at your own risk. Always keep sufficient parts stored securely and separately; if you fall below the threshold, recovery is impossible.
