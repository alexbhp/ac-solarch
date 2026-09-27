---
case_id: VND-1103
status: intake_incomplete
vendor_legal_name: Globex Field Systems, Inc.
website: "https://www.globex.example"
touches_customer_data: true
business_owner:
target_start_date: 2026-12-01
requester: Casey Ng, Operations
pilot_days:
sources_mode: mocked
research_started: true
missing_fields: business_owner
security_required: true
security_decision: not_opened
security_signed_by:
manager_required: true
manager_decision: not_opened
manager_signed_by:
---

Status: intake_incomplete
Case: VND-1103
See it in Cursor: cases/VND-1103/

## What I automated

- The requester said only "We need to onboard Globex."
- From the mocked public pages: legal name Globex Field Systems, Inc., website, customer data yes, and a pilot date printed on the page.
- Marked the start date 2026-12-01 as inferred, not confirmed.
- Stopped when the Acme business owner was not on the vendor site.

## What still needs a person

- The Acme business owner. That is the only open field.
- Security and the manager stay closed until that name exists.

I did not approve this vendor.
