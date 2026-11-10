# WORKNA product capability map

This plan is informed by current public product/help documentation for Upwork, Fiverr, Amazon Seller Central, Jumia's WORKNA seller workflow, Paystack and Flutterwave. It is a capability map, not a claim that every capability is already implemented.

## Product principles

- One account can act as a buyer, seller, client and freelancer.
- Local-first payments and operations: NGN first, Paystack primary, Flutterwave optional.
- Listings and profile cards must come from real database records. Empty states are preferable to fabricated inventory, ratings or testimonials.
- Keep buyer/seller/freelancer workspaces connected through orders, proposals, conversations, payment records and a transparent ledger.
- Build accessible dark and light themes, mobile-first layouts, keyboard support and reduced-motion fallbacks.

## E-commerce capabilities (Amazon + Jumia patterns)

| Capability | WORKNA status |
| --- | --- |
| Public product catalogue, categories, search and product detail | Implemented foundation |
| Seller storefronts, product publishing and stock editing | Implemented foundation |
| Cart and checkout order creation | Implemented foundation |
| Seller order/fulfilment workspace | Implemented foundation |
| NGN checkout through Paystack / Flutterwave adapters | Integration code present; credentials and end-to-end test required |
| 10% WORKNA commission and seller net earnings ledger | Implemented in webhook and ledger layer; test transactions required |
| Product variants (size, colour, model), bulk import and SKU/barcodes | Planned |
| Saved items / wishlists and recently viewed | Planned |
| Product ratings, verified-purchase reviews, seller ratings and moderation | Planned |
| Delivery options, shipping fees, tracking, pickup and delivery confirmation | Planned |
| Returns, refunds, cancellations and buyer/seller resolution centre | Planned |
| Seller promotions, coupons, bundles and featured placements | Planned |
| Sponsored listings and seller advertising analytics | Planned |
| Seller sales analytics, conversion reports and low-stock alerts | Planned |
| Bulk listing tools, stock reservations and multi-location inventory | Planned |
| Brand storefront customization and seller teams/permissions | Planned |

## Freelance services and project work (Upwork + Fiverr patterns)

| Capability | WORKNA status |
| --- | --- |
| Freelancer profiles, skills, rates and directory | Implemented foundation |
| Client job posting and freelancer proposals | Implemented foundation |
| Private messaging and realtime updates | Implemented foundation |
| Proposal history and buyer/seller dashboards | Implemented foundation |
| Fixed-price jobs and proposal bids | Implemented foundation |
| Packaged services / Fiverr-style service catalogue | Planned |
| Three service tiers (Basic / Standard / Premium), add-ons and custom offers | Planned |
| Client briefs, freelancer invitations and shortlist | Planned |
| Contract offers, acceptance and active contract workroom | Planned |
| Milestones, client funding, deliverable submissions and approvals | Planned |
| Escrow-like protected milestone release | Planned; requires payment-provider and legal design |
| Hourly contracts, time tracking and weekly limits | Planned |
| Portfolio media, intro videos and certifications | Planned |
| Reviews, ratings, testimonials and repeat-client signals | Planned |
| Saved searches, job alerts and freelancer availability scheduling | Planned |
| Agency profiles, team members and permissions | Planned |
| Disputes, refunds, cancellation policy and trust/safety reporting | Planned |
| Seller/freelancer earnings, payout history and admin-reviewed Paystack transfers | Implemented foundation; requires credentials and live operational testing |

## Trust, operations and platform administration

| Capability | WORKNA status |
| --- | --- |
| Authenticated accounts and profile roles | Implemented foundation |
| Row-level security and server-only privileged operations | Implemented foundation |
| Admin email allowlist and operations dashboard | Implemented foundation; admin email still needs configuration |
| Payment event log and verified provider webhook handlers | Implemented foundation; test credentials needed |
| Seller bank recipient onboarding | Implemented foundation; Paystack test credential needed |
| Manual payout approval queue | Implemented foundation; requires transfer testing |
| 10% commission recorded separately from seller earnings | Implemented foundation; webhook test needed |
| Identity/KYC checks, fraud monitoring and seller risk reviews | Planned |
| Admin content moderation, listing takedowns and audit trails | Planned |
| Support tickets, help centre, notifications and email templates | Planned |
| Tax invoices, reconciliation exports and accounting reports | Planned |

## Suggested build order

1. Finish environment setup and complete a Paystack test purchase, commission credit and seller transfer.
2. Build service packages, custom offers and a project/contract workroom with milestones.
3. Add verified reviews, wishlists, seller analytics and saved searches/job alerts.
4. Add shipping, delivery tracking, returns and refunds for physical products.
5. Add moderation, disputes, KYC, notification centre and deeper admin reporting.
6. Add bulk seller tools, promotions, coupons, ads and multi-user seller teams.

## Research references

- Upwork client and talent tools: https://www.upwork.com/pricing/client and https://www.upwork.com/pricing/freelancer
- Upwork proposal review and hiring: https://support.upwork.com/hc/en-us/articles/18010402882195--Review-job-proposals
- Upwork contract and payment protection: https://support.upwork.com/hc/en-us/articles/17931377993107--Decide-between-hourly-and-fixed-price-contract and https://support.upwork.com/hc/en-us/articles/211062568-How-Upwork-protects-your-payments
- Upwork messages and project room: https://www.upwork.com/resources/how-to-use-upwork-messaging
- Fiverr freelancer dashboard: https://help.fiverr.com/hc/en-us/articles/360011653458-Freelancer-dashboard-for-web-and-mobile-app
- Fiverr briefs: https://help.fiverr.com/hc/en-us/articles/37552341279633-Post-a-project-brief-get-tailored-offers-for-your-project
- Fiverr seller analytics: https://help.fiverr.com/hc/en-us/articles/6523401252881-Advanced-Analytics-for-Seller-plus
- Amazon Seller Central: https://sell.amazon.com/tools/seller-central
- Amazon seller tools: https://sell.amazon.com/tools
- Paystack split payments: https://paystack.com/docs/payments/split-payments/
- Paystack transfers: https://paystack.com/docs/transfers/single-transfers/
- Flutterwave authentication and webhook security: https://developer.flutterwave.com/docs/authentication and https://developer.flutterwave.com/docs/webhooks

Jumia's seller-facing flows are included as product requirements for local seller onboarding, catalog management, order processing, delivery/fulfilment, seller settlements and promotions. Exact availability and eligibility vary by market and seller account.
