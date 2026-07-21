# BaseMint

BaseMint is a mobile-first Base Mini App where users mint one free ERC721A NFT every day. Every successful mint awards the NFT, +10 points for the minter, streak progress, and referral rewards when the first mint includes a valid inviter.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Wagmi + Viem with native Wagmi config
- Coinbase Wallet, MetaMask, OKX Wallet, and injected wallet connectors
- ERC721A smart contract
- Vercel KV for production API persistence, with in-memory local fallback

## Base Attribution

This project implements both required Base attribution paths:

- Offchain: `base:app_id` is hardcoded in `app/layout.tsx`.
- Onchain: ERC-8021 `dataSuffix` is configured in `lib/wagmi.ts` from `NEXT_PUBLIC_BUILDER_CODE`.

After the first Vercel deployment, verify your Builder Code in Base.dev and paste the values here:

- Builder Code placeholder: `NEXT_PUBLIC_BUILDER_CODE=`
- Encoded String placeholder: `0x`

Deploy again after the Builder Code is verified so onchain attribution is active for all future writes.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Contract

```bash
npm run compile
npm run test
npm run deploy:base
```

Set `NEXT_PUBLIC_CONTRACT_ADDRESS` to the deployed contract address before building the frontend.

## Deployment

GitHub and Vercel deployments require tokens in your shell environment. This repo intentionally does not store secrets.

```bash
git init
git add .
git commit -m "Initial BaseMint production app"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/YOUR_REPO.git
git push -u origin main

npx vercel --prod --token "$VERCEL_TOKEN"
```

For a stable Vercel URL, connect the GitHub repo to a Vercel project once, set env vars in Vercel, then deploy from the same project for subsequent releases.
