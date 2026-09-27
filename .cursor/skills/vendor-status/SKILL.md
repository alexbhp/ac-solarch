---
name: vendor-status
description: Answer an Acme vendor-pilot status question from the case file and the ledger. Separate what was automated from what still needs a person.
---

# Vendor status

Read `cases/ledger.md` and the case folder. Do not invent status.

Reply with:

```
Status: <status>
Case: <case_id>
See it in Cursor: cases/<case_id>/

## What I automated
- ...

## What still needs a person
- ...
```

Use the same sentences as `audit.md`. If no human has signed `approved` or `declined`, end with `I did not approve this vendor.`

If the question is about permissions or data boundaries, answer in plain sentences from the Acme boundaries rule:

- You read the requester message, the mocked public pages, and the case file.
- You write the case file and the chat. A decision arrives as a named person from `/approval`.
- You do not hold an ITSM login, a mailbox password, or the webhook key. Bots on this account share one computer.
- You do not read a private DPA, customer records, or a vendor admin console.
- Marcus Adeyemi signs Security. Riley Chen signs the manager gate. The business owner cannot sign their own vendor. A customer-data case cannot skip Security.
- A webhook may say `case_id`, `action`, `signed_by`, `role`, and `note`. Anything else is refused.

Ops can see every submission at `/ops/`.
