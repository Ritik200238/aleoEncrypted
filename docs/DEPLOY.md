# EncryptedSocial — Deployment Guide

## Prerequisites
- Aleo testnet private key with credits (get from https://faucet.aleo.org)
- Railway account (https://railway.app) for backend deployment

---

## 1. Deploy `private_tips_v2.aleo` to Aleo Testnet

This contract fixes the amount leakage issue from v1. Stores `bool` (not amount) in `tip_receipts` mapping.

```bash
cd leo/private_tips
leo deploy --network testnet --private-key APrivateKey1zkpYOUR_KEY_HERE
```

After deployment:
1. Copy the transaction ID from the output
2. Update `frontend/src/App.tsx` CONTRACTS array — change `private_tips.aleo` to `private_tips_v2.aleo` with the new TX
3. Update `frontend/src/config/aleoConfig.ts` — change `privateTips` to `'private_tips_v2.aleo'`
4. Update `frontend/src/services/leoContractService.ts` — change `PRIVATE_TIPS` to `'private_tips_v2.aleo'`
5. Update `frontend/src/App.tsx` VERIFY_STEPS — change URL to use `private_tips_v2.aleo`

---

## 2. Deploy Backend Relay to Railway

The backend is a Socket.io WebSocket relay. Already configured in `backend/railway.toml`.

```bash
cd backend
railway login
railway init        # Create new project
railway up          # Deploy
```

**Environment Variables to set in Railway dashboard:**
- `PORT`: 3001 (Railway will override with its own port)
- `CORS_ORIGIN`: `https://encrypted-social-aleo.vercel.app`

After deployment:
1. Copy the Railway URL (format: `https://your-service.up.railway.app`)
2. Update `frontend/src/services/websocketService.ts` — change the production URL from
   `wss://encrypted-social-relay.up.railway.app` to your actual Railway URL
3. Set `VITE_WS_URL=wss://your-service.up.railway.app` in Vercel environment variables

---

## 3. Verify Deployments

### Verify private_tips_v2.aleo
```bash
curl https://api.explorer.provable.com/v1/testnet/program/private_tips_v2.aleo
```

### Verify backend health
```bash
curl https://your-service.up.railway.app/health
```

---

## 4. Final Steps

1. Push all updates to GitHub (Vercel auto-deploys)
2. Submit Wave 2 on Akindo: https://app.akindo.io/communities/aleo
   - Project name: EncryptedSocial
   - GitHub: https://github.com/Ritik200238/aleoEncrypted
   - Live demo: https://encrypted-social-aleo.vercel.app
   - Deployed contracts: (list all 6 from CONTRACTS array in App.tsx)

---

## Contract Transaction IDs (already deployed)

| Contract | TX |
|---|---|
| group_manager.aleo | at12gkmegshtlsjgzfpng4ls8mprlwc0s5l9573wy9khlqcelf97cqs36kwew |
| membership_proof.aleo | at1heup986u7f0hhd26um6mmfvp95uq9yfmv2xa5vzh2yvd7g4d6qpsx5q9f4 |
| message_handler.aleo | at1nejj3turtptuu0ddl5f0axv9mmscgzcfum9049tfxpm9wfk8zy9qmsct0q |
| tip_receipt.aleo | at17zg5efd6lqv33jtshcf9gfdqtcapycscak8ej3ydexqtkw57fqqsjqmyfr |
| private_tips.aleo | at1cr03ja49m6prfjln7zpp9klt00fmcpzv2p704h5700n2sj8jq5zsqtk3uk |
| group_membership.aleo | at1ksfdjkpvsrvuqnp6zurgp9feqycjkqkths9pa5gmemxzaryl8s8q3stazt |
