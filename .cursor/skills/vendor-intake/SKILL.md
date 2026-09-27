---
name: vendor-intake
description: Capture an Acme vendor-pilot request. When all five fields are in the message, write the next case folder with no research. Keep Contoso, Initech, and Globex on their existing ids.
---

# Vendor intake

Required fields: vendor legal name, website, touches customer data (yes or no), business owner, target start date.

## Existing cases

If the vendor is one of these, use that folder. Do not invent a second id.

- Contoso Analytics, Inc. → `cases/VND-1101`
- Initech Ledger, Inc. → `cases/VND-1102`
- Globex → `cases/VND-1103`

## A new vendor

Use this when the vendor is not one of those three and the message already contains all five fields.

1. Read the `VND-` folder names and `cases/ledger.md`. The new id is one higher than the highest number.
2. Write `cases/<id>/case.md`, `audit.md`, and `approval-email.md`.
3. Set `research_started: false` and `sources_mode: none`. Do not create a research pack. Do not read `fixtures/public-web/`.
4. If the vendor will touch customer data, status is `awaiting_security`. Otherwise status is `awaiting_manager` and Security stays closed.
5. Add one row to `cases/ledger.md`.
6. The approval link is `https://ac-solarch.vercel.app/approval/<id>`.

The email goes to Marcus Adeyemi when Security is open, and to Riley Chen when the manager is open. Leave sending to the Vendor Intake bot. It sends only after its own approval card.

## Missing fields

If any required field is empty, status is `intake_incomplete`. Ask only for the missing fields. Do not open Security, the manager, or an approval email.

Write `audit.md` before you reply. End with the handoff block. The last line is `I did not approve this vendor.`
