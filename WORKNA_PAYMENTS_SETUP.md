# WORKNA payments and seller payouts

## Before accepting real money

Use provider **test credentials** first. Never place secrets in chat, source files, GitHub, or any `NEXT_PUBLIC_*` variable. Add them in Vercel → Project → Settings → Environment Variables, then redeploy.

Required server-side variables:

- `SUPABASE_SECRET_KEY` — Supabase secret key for server-only order, ledger and payout operations.
- `PAYSTACK_SECRET_KEY` — Paystack test key for staging; live key only after merchant verification.
- `FLUTTERWAVE_SECRET_KEY` — optional alternative checkout provider.
- `FLUTTERWAVE_SECRET_HASH` — webhook verification hash from Flutterwave.
- `NEXT_PUBLIC_SITE_URL` — exact deployed origin, including https.
- `WORKNA_ADMIN_EMAILS` — comma-separated email allowlist for the admin console.
- `WORKNA_COMMISSION_BPS` — marketplace sales commission in basis points. `1000` means 10%. This is deducted from each seller's confirmed sale credit. Seller withdrawals do not incur a second commission.

## Webhook URLs

Configure the production webhook URLs in the provider dashboards:

- Paystack: `https://<your-workna-domain>/api/payments/webhook/paystack`
- Flutterwave: `https://<your-workna-domain>/api/payments/webhook/flutterwave`

For test credentials, point the provider's test-mode webhook to the preview deployment:

- Paystack test: `https://<your-workna-preview-domain>/api/payments/webhook/paystack`
- Flutterwave test: `https://<your-workna-preview-domain>/api/payments/webhook/flutterwave`

Paystack webhooks are authenticated with the SHA-512 HMAC signature. Flutterwave uses its configured webhook secret hash and server-side transaction verification.

## Seller payout flow

1. Seller adds a Nigerian bank account in Dashboard → Payouts & earnings.
2. WORKNA creates a Paystack transfer recipient. The full account number is sent to Paystack and is not stored in WORKNA; only the recipient code and last four digits are retained.
3. A verified successful payment credits each seller's wallet ledger once, after deducting the 10% marketplace commission. The platform commission is separately recorded in `platform_ledger`, also idempotently.
4. Seller requests a payout. The database function checks their net earnings balance and reserves the requested amount atomically; no second withdrawal fee is charged.
5. An allowlisted administrator reviews the request in `/admin`.
6. Approval submits a Paystack transfer from the platform's Paystack balance. Paystack transfer webhooks update the payout to paid or failed; a failed transfer returns the reserved amount to the seller ledger.

The platform must have Paystack Transfers enabled and sufficient settled balance. Payouts remain manual-review transfers; they are not direct Paystack split settlements.

## Go-live checklist

- Complete Paystack business verification and enable Transfers.
- Add test credentials and verify a complete test purchase and webhook.
- Verify seller bank-recipient creation and a test transfer.
- Set the admin email allowlist. The agreed 10% sales commission is configured as `WORKNA_COMMISSION_BPS=1000`.
- Replace test keys with live keys only after end-to-end test sign-off.
- Configure both provider webhook URLs and confirm events appear in the admin console.
- Have legal/accounting review marketplace fees, refunds, chargebacks, seller verification and payout timing before public launch.
