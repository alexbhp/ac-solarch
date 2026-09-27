# Demo script

About 30 minutes. Say what is mocked and what is live.

Mocked: the three vendor websites, and the three seeded cases.
Live: the home page at `/`, the Vendor Intake bot, the email it sends after its approval card, `/approval/<case id>`, `/ops/` reading the ledger from GitHub, `/api-literacy/`, and `node scripts/validate-case.mjs`.
Not built: a Grok API call. Not built: a second bot.

## 1. Deck, about five minutes

Screen-share https://ac-solarch.vercel.app. The home page lists every path, including the API crib. Open Deck. Pain, outcomes, architecture, bot flow. The outcomes slide points at `/ops/` and at the Security questions.

## 2. Paste a request

The bot does not list cases until a request is in the chat. This pass is a new run: Contoso is `awaiting_security` again, and earlier approvals in the thread do not count. Open `/dataset/`. Copy a full message.

Contoso, all five fields:

```
We need to onboard Contoso Analytics, Inc. (https://www.contoso.example) for a 90-day pilot. They will touch customer data. Business owner is Priya Shah, Director of Finance Operations. Target start 2026-10-20.
```

The bot keeps the fields, points at `cases/VND-1101/`, and stops for Marcus Adeyemi. It does not approve. After its approval card, it sends from the Gmail connector `ciutrust@gmail.com` to `alexbhp@gmail.com`. The link in that message is `https://ac-solarch.vercel.app/approval/VND-1101`.

Initech, three of five:

```
We need to onboard Initech Ledger, Inc. Business owner is Elena Voss, VP Finance Operations. Target start 2026-11-03.
```

The bot fills website and customer data no from the fixture, leaves Security closed, and stops for Riley Chen. Case `VND-1102`. The link is `/approval/VND-1102`.

Globex, no fields:

```
We need to onboard Globex.
```

The bot finds four fields, marks the start date inferred, and asks only for the Acme business owner. Case `VND-1103`. No approval email.

A fourth vendor, all five fields, and not one of those three: the intake skill writes the next id (`VND-1104`, then `VND-1105`). `research_started` is false. There is no pack and no fixture. Customer data opens Security. No customer data opens the manager. The bot sends the email. The page works after that folder is on `main`.

Optional status check: "Where is the Contoso pilot?"

## 3. Cursor

Open the case the bot named. Show the boundaries rule, the skill that filled the gaps, the pack when research ran, the audit, and the ledger.

```
node scripts/validate-case.mjs
```

VND-1101, VND-1102, and VND-1103 pass. VND-9999 fails because a customer-data case skipped Security and the approval has no manager signature.

```
node scripts/validate-case.mjs fixtures/invalid/VND-9999
```

That command exits 1. A new five-field case with `research_started: false` and `sources_mode: none` also passes:

```
node scripts/validate-case.mjs cases/VND-1104
```

## 4. Approval click

Open the email link, or go to `/approval/VND-1101`. Ops rows go to the same path.

- Logged in as Marcus Adeyemi. Approve. The approval page shows `Approval Decision for Security by Marcus Adeyemi submitted to Vendor Intake Bot (Grok Bot).` at the click. The bot chat gets that sentence when the routine finishes, which can be after the Cursor card appears. The case moves to the manager.
- Logged in as Riley Chen on VND-1101 after Security. Approve. The thread starts with **VENDOR IS APPROVED**, and the Cursor card is there again.
- Logged in as Elena Voss on VND-1102. Approve. The bot refuses. She is the business owner.
- Logged in as Riley Chen on VND-1102. Deny. The bot says it received the decision, shows the Cursor card, and the agent records declined.
- Globex, `/approval/VND-1103`. The page says the business owner is still missing and there is nothing to approve or deny. Logged in as, Approve, and Deny are not shown.

The page has Approve and Deny only. Either one posts `case_id`, `action`, `signed_by`, and `role`.

If the webhook env vars are empty, the page says the decision stayed on the page. Say that, then show the pre-seeded case. Do not pretend the bot moved.

## 5. Prove the two lines

Ops: open `/ops/`. The rows come from `cases/ledger.md` on `main`. Contoso needs Marcus. Initech needs Riley. Globex needs an owner. Click a case id. The bot's handoff uses the same two headings.

Security, asked in the bot:

- What can you read?
- What are you allowed to change?
- Who is allowed to approve?

Then open `.cursor/rules/acme-boundaries.mdc` and show the same sentences. The validator is the enforcement, not only the speech.

## 6. If they ask about the API

Use `docs/api-literacy.md`. No call is built. The API would enter behind an ITSM webhook or to fill packs at volume. It would not approve, and it would not replace the bot as the front door.

## 7. Grok bot reset

Use this after a test approval, before the next pass. Paste it into the Vendor Intake bot and tell it to save the text on the Acme vendor intake skill. Start a new chat after it saves. The webhook routine stays.

```
This is a reset. The next request and the next webhook are a new run. Earlier Contoso approvals in this chat are void. VND-1101 on main is awaiting_security again. Marcus Adeyemi has not signed. Riley Chen has not signed. Do not treat an earlier message, an earlier cloud agent, or an earlier webhook as a signature. Do not list cases until a vendor request is in this chat.
```

The case file is the record. If a cloud agent already committed an approval, restore `cases/VND-1101/` and the Contoso row in `cases/ledger.md` on `main` before the next click. The prompt clears what the bot remembers. It does not undo that commit.
