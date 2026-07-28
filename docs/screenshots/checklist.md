# Screenshot Checklist

| # | Screenshot | Required For | Captured? | Filename |
|---|------------|-------------|-----------|----------|
| 1 | Wallet connected state (Freighter showing address) | Level 1 | ⬜ | `wallet-connected.png` |
| 2 | XLM balance displayed in UI | Level 1 | ⬜ | `balance-displayed.png` |
| 3 | Successful testnet XLM transaction | Level 1 | ⬜ | `successful-transaction.png` |
| 4 | Wallet options (Freighter + other) available | Level 2 | ⬜ | `wallet-options.png` |
| 5 | Mobile responsive UI | Level 3 | ✅ | `mobile-responsive.png` |
| 6 | CI/CD pipeline running (GitHub Actions) | Level 3 | ✅ | `ci-pipeline.txt` |
| 7 | Test output with 3+ passing tests | Level 3 | ✅ | `test-output.txt` |
| — | Welcome page (disconnected state) | Bonus | ✅ | `welcome-page.png` |
| — | 404 page | Bonus | ✅ | `404-page.png` |

## Capture Instructions

### Wallet connected state
1. Start the app: `make web-dev`
2. Open browser to localhost:3000
3. Click "Connect Wallet"
4. Approve in Freighter extension
5. Screenshot showing connected address + balance

### Balance displayed
1. After connecting, the balance panel should show XLM amount
2. Screenshot the balance area

### Successful testnet XLM transaction
1. Connect wallet with testnet funds
2. Enter recipient address and amount
3. Click send and approve in Freighter
4. Screenshot the success state with transaction hash

### Wallet options (Level 2)
1. Click "Connect Wallet" to open wallet selector
2. Screenshot showing available wallet options

### Mobile responsive (Level 3)
1. Open browser DevTools
2. Toggle to mobile viewport (375px width)
3. Screenshot the full dashboard

### CI/CD pipeline (Level 3)
1. Go to GitHub Actions tab
2. Open the most recent CI run
3. Screenshot showing all green checks

### Test output (Level 3)
1. Run `make test`
2. Screenshot the terminal output with 3+ passing tests
