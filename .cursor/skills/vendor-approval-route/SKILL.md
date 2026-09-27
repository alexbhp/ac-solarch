---
name: vendor-approval-route
description: Open the Acme approval route after intake and the public checklist are complete. Security signs first only when the vendor touches customer data. Never set approved or declined.
---

# Approval routing

Run this only when all five intake fields are present and the research checklist is complete.

- If `touches_customer_data` is true, set `security_required: true`, `security_decision: pending`, and status `awaiting_security`. The manager waits.
- If `touches_customer_data` is false, set `security_required: false`, `security_decision: not_required`, and status `awaiting_manager`.

The manager is always required before `approved`. Set `manager_required: true` and `manager_decision: pending`. Leave both signatures empty.

Write `approval-email.md` as a draft. The link is `/approval/?case=<case_id>`. Do not send it.

You may not set `approved` or `declined`. You may not put bot, agent, grok, cursor, or system in a signature. The business owner is not the signer.

Marcus Adeyemi is Security. Riley Chen is the finance approver. A webhook may carry `case_id`, `action`, `signed_by`, `role`, and `note`. Record the decision only when that person is the signer for the open gate. Otherwise leave the status and say who you are waiting on. `more_info` does not change status.

The last line of the handoff stays `I did not approve this vendor.` until a human has signed.
