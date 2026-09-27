# Demo script

About 30 minutes. Say what is mocked and what is live.

Mocked: the three vendor websites, the case files, the ledger, `/dataset/`, `/ops/`, and the draft emails.
Live: the Vendor Intake bot, the `/approval/` click when the webhook env vars are set, and `node scripts/validate-case.mjs`.
Not built: a Grok API call.

## 1. Deck, about five minutes

Screen-share https://ac-solarch.vercel.app. Pain, outcomes, architecture, bot flow. The outcomes slide points at `/ops/` and at the Security questions.

## 2. Paste a request

Open `/dataset/`. Copy a full message.

Contoso, all five fields:

```
We need to onboard Contoso Analytics, Inc. (https://www.contoso.example) for a 90-day pilot. They will touch customer data. Business owner is Priya Shah, Director of Finance Operations. Target start 2026-10-20.
```

The bot keeps the fields, points at `cases/VND-1101/`, and stops for Marcus Adeyemi. It does not approve.

Initech, three of five:

```
We need to onboard Initech Ledger, Inc. Business owner is Elena Voss, VP Finance Operations. Target start 2026-11-03.
```

The bot fills website and customer data no from the fixture, leaves Security closed, and stops for Riley Chen. Case `VND-1102`.

Globex, no fields:

```
We need to onboard Globex.
```

The bot finds four fields, marks the start date inferred, and asks only for the Acme business owner. Case `VND-1103`. No approval link.

Optional status check: "Where is the Contoso pilot?"

## 3. Cursor

Open the case the bot named. Show the boundaries rule, the skill that filled the gaps, the pack, the audit, and the ledger.

```
node scripts/validate-case.mjs
```

VND-1101, VND-1102, and VND-1103 pass. VND-9999 fails because a customer-data case skipped Security and the approval has no manager signature.

```
node scripts/validate-case.mjs fixtures/invalid/VND-9999
```

That command exits 1.

## 4. Approval click

Open the draft link, or go to `/approval/?case=VND-1101`.

- Logged in as Marcus Adeyemi. Approve. The bot's thread should say Security signed and the manager is next.
- Logged in as Elena Voss on VND-1102. Approve. The bot refuses. She is the business owner.
- Logged in as Riley Chen on VND-1102. More information required, with a note. The status stays. The bot posts the question.
- Globex. The buttons are off.

If the webhook env vars are empty, the page says the decision stayed on the page. Say that, then show the pre-seeded case. Do not pretend the bot moved.

## 5. Prove the two lines

Ops: open `/ops/`. Three rows. Contoso needs Marcus. Initech needs Riley. Globex needs an owner. The bot's handoff uses the same two headings.

Security, asked in the bot:

- What can you read?
- What are you allowed to change?
- Who is allowed to approve?

Then open `.cursor/rules/acme-boundaries.mdc` and show the same sentences. The validator is the enforcement, not only the speech.

## 6. If they ask about the API

Use `docs/api-literacy.md`. No call is built. The API would enter behind an ITSM webhook or to fill packs at volume. It would not approve, and it would not replace the bot as the front door.
