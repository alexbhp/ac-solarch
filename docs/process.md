# Acme vendor onboarding

Process, fixed by Maya Chen: intake, then a public research pack, then approval routing.

Acme is fictional. Every vendor, employee, and page in this repo is fictional. Public sources in the demo are mocked fixtures. Say that out loud.

## Required intake fields

1. Vendor legal name
2. Website
3. Touches customer data (yes or no)
4. Business owner
5. Target start date

The business owner is an Acme employee. A vendor website cannot supply that name. A target start date counts as found only when the requester stated it, or when a public pilot page prints a date. A date taken from a public page is marked inferred, not confirmed.

## Status

| Status | Meaning |
| --- | --- |
| `intake_incomplete` | A required field is still empty. The bot asks only for that field. |
| `research_gap` | Intake fields are present and a checklist row is still blank. Approval stays closed. |
| `awaiting_security` | All five fields are present and the vendor will touch customer data. Security signs before the manager. |
| `awaiting_manager` | The manager has not signed. Security has already approved, or Security stayed closed because the vendor does not touch customer data. |
| `approved` | A named person signed. An agent cannot set this. |
| `declined` | A named person signed a decline. An agent cannot set this. |

Agents may set only the first four. `approved` and `declined` need a human `signed_by` that is not bot, agent, grok, cursor, or system.

Security is required only when the vendor will touch customer data. The manager is always required before `approved`. Security signs first when required.

## Enough research

Each row is complete only with one of these answers. A blank is incomplete.

- Website: `found` or `unreachable`
- Trust page: `found` or `not_found`
- Public pricing: `found` or `not_published`
- Data touch restated, and the pack body contains `Data touch: yes` or `Data touch: no` matching the case flag
- Sources listed, with an https URL for each found page
- Gaps: `none` or a listed gap

`not_found` and `not_published` are complete answers. A missing private DPA is not a research gap. Security owns that.

## Worked examples

Do not invent a second case id for these vendors.

| Message | Case | What happens |
| --- | --- | --- |
| Contoso, all five fields | `cases/VND-1101` | Pack is built. Stops for Security. |
| Initech, three of five | `cases/VND-1102` | Research fills website and customer data (no). Stops for the manager. Security stays closed. |
| Globex, no fields | `cases/VND-1103` | Research finds four fields. The owner is not on the public web. Asks only for the owner. No approval link. |
| Any other vendor, all five fields | the next `VND-` id | No research pack. Status is `awaiting_security` or `awaiting_manager`. The bot sends the email. |

## Record

Every submission gets a case folder and a row in `cases/ledger.md` as soon as intake starts. Each folder has `audit.md` with the headings `Automated` and `Needs a person`. Ops reads the same split at `/ops/`. The bot's handoff uses those same headings.

The agent reads mocked public pages and the case file. It does not approve, and it does not hold an ITSM credential, a mailbox password, or the webhook key.

When the requester already supplied all five fields, research does not run. `research_started` is `false` and `sources_mode` is `none`. The intake skill writes `case.md`, `audit.md`, `approval-email.md`, and the ledger row. The Vendor Intake bot sends that email after its own approval card. The link is `https://ac-solarch.vercel.app/approval/<case id>`. Customer data goes to Marcus Adeyemi. Otherwise it goes to Riley Chen. The bot does not send because a webhook said so.

`/ops/` and `/approval/<case id>` read the case from GitHub `main` when the page loads. A push is enough. There is no second copy and no database.
