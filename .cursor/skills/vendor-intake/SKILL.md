---
name: vendor-intake
description: Capture an Acme vendor-pilot request. Keep every required field the requester already gave, research only the public gaps, and ask only for what is still missing. Use the worked-example case id when the vendor is Contoso, Initech, or Globex.
---

# Vendor intake

Required fields: vendor legal name, website, touches customer data (yes or no), business owner, target start date.

## Worked examples

If the vendor is one of these, use that case. Do not invent a second id. Do not browse the live web. The fixtures are mocked.

- Contoso Analytics, Inc. → `cases/VND-1101`
- Initech Ledger, Inc. → `cases/VND-1102`
- Globex → `cases/VND-1103`

## What to keep

Copy fields from the requester's message onto the case before you research. Do not ask again for a field they already gave.

## What research may fill

Only from `fixtures/public-web/`:

- Legal name, when the public page states it
- Website
- Whether the vendor touches customer data, restated from the public page
- A target start date only when a public pilot page prints one. Mark that date inferred, not confirmed.

Research never fills the business owner. That person is an Acme employee.

## What to ask

Ask only for the fields that are still empty after that. One question, naming the missing fields. Globex's only question is the business owner.

## When to stop

- Any required field still empty → `intake_incomplete`. Do not open Security, the manager, or an approval email.
- All five fields present and the checklist has a blank → `research_gap`. Approval stays closed.
- Otherwise hand the case to the research pack, then to approval routing.

Write `audit.md` and update `cases/ledger.md` before you reply. End with the handoff block. The last line is `I did not approve this vendor.`
