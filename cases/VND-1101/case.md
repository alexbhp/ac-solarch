---
case_id: VND-1101
status: approved
vendor_legal_name: Contoso Analytics, Inc.
website: "https://www.contoso.example"
touches_customer_data: true
business_owner: Priya Shah, Director of Finance Operations
target_start_date: 2026-10-20
requester: Jordan Hale, Revenue Operations
pilot_days: 90
sources_mode: mocked
research_started: true
missing_fields:
security_required: true
security_decision: approved
security_signed_by: Marcus Adeyemi
manager_required: true
manager_decision: approved
manager_signed_by: Riley Chen
---

Status: approved
Case: VND-1101
See it in Cursor: cases/VND-1101/

## What I automated

- Kept all five intake fields from Jordan Hale's message.
- Built the research pack from the mocked Contoso website, trust page, and pricing page.
- Opened Security because the pilot reads customer usage exports.
- Recorded Marcus Adeyemi's approval at the Security gate from the approval webhook and moved the case to the manager gate.
- Recorded Riley Chen's approval at the manager gate from the approval webhook.

## What still needs a person

- None; Security and manager gates are both signed.
