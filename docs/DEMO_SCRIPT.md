# Stellar Drips — Demo Script

*Target duration: 1–2 minutes*

## Setup (pre-recorded or quick live)
- Ensure Freighter wallet is installed and funded on testnet
- App is running at [live-demo-url] or `localhost:3000`

## Demo Flow

### 1. Connect Wallet (~15s)
> "Here's Stellar Drips — a recurring payment service on the Stellar network."
- Click "Connect Wallet"
- Select Freighter
- Approve connection
- **Show:** wallet address displayed, network indicator shows "Testnet"

### 2. View Balance (~10s)
> "Once connected, the dashboard shows my XLM balance on testnet."
- **Show:** XLM balance displayed

### 3. Create Subscription (~30s)
> "Let me create a subscription — I'll set up a recurring payment."
- Fill in recipient address
- Set amount and interval
- Approve the transaction in Freighter
- **Show:** subscription created confirmation

### 4. Execute Payment (~20s)
> "The off-chain scheduler picks up due subscriptions and calls the Soroban contract."
- Run `make scheduler-dry-run` or show GitHub Actions
- **Show:** payment execution confirmation (or dry-run log)

### 5. Dashboard (~15s)
> "The event dashboard shows all subscription activity in real-time."
- **Show:** event feed with subscription_created, payment_executed events
- **Show:** upcoming payments panel

### 6. Wrap (~10s)
> "Stellar Drips — recurring payments, powered by Soroban. Check out the repo for contract code, tests, and CI/CD pipeline."

## Backup Plan
- If Freighter not available: show wallet connection UI only
- If contract not deployed: show contract code and tests instead
- If no network: show local dev server with mock data
- Always: have screenshots ready as fallback
