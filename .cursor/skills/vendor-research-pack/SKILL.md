---
name: vendor-research-pack
description: Build the Acme public research pack from the checklist and mocked vendor pages. Not-found and not-published are complete answers. Do not treat the pack as approval.
---

# Research pack

Skip this skill when the requester already gave all five intake fields. That case sets `research_started: false` and does not get a pack.

Do not open `fixtures/public-web/` until this chat names a vendor that is still missing a public field. Use `templates/checklist.md` and `templates/research-pack.md` only then. Read only `fixtures/public-web/<vendor>/`.

Set `research_started: true` and `sources_mode: mocked`.

For each checklist row, write `found`, `unreachable`, `not_found`, or `not_published`. A blank is incomplete. Point `*_evidence` at the fixture file you read. That path must exist.

In the body:

- `Data touch: yes` or `Data touch: no`, matching the case flag
- `## Sources` with an https URL for every page you marked found
- `Gaps: none` when nothing public is missing, otherwise list the gap

Do not list a missing private DPA as a gap. Do not list the business owner as a gap.

If the checklist is complete and a required intake field is still empty, leave the case at `intake_incomplete` and name that field. If the checklist itself has a blank, set `research_gap` and do not open approval.

Update `audit.md` so `## Automated` lists the pages you checked and `## Needs a person` lists what you did not decide.
