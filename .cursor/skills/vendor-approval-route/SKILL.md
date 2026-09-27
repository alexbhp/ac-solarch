---
name: vendor-approval-route
description: Open the Acme approval route after all five intake fields exist. Security signs first only when the vendor touches customer data. Never set approved or declined.
---

# Approval routing

Run this when all five intake fields are present. A research pack is not required when those fields came from the requester.

- If `touches_customer_data` is true, set `security_required: true`, `security_decision: pending`, and status `awaiting_security`. The manager waits.
- If `touches_customer_data` is false, set `security_required: false`, `security_decision: not_required`, and status `awaiting_manager`.

The manager is always required before `approved`. Set `manager_required: true` and `manager_decision: pending`. Leave both signatures empty.

Write `approval-email.md`. The link is `https://ac-solarch.vercel.app/approval/<case_id>`. From is `ciutrust@gmail.com`. To is `alexbhp@gmail.com`. The body names the signer: Marcus Adeyemi for Security, Riley Chen for the manager. The Vendor Intake bot sends that email with the Gmail connector for `ciutrust@gmail.com` after its approval card. Do not treat the draft as a decision.

You may not set `approved` or `declined`. You may not put bot, agent, grok, cursor, or system in a signature. The business owner is not the signer.

Marcus Adeyemi is Security. Riley Chen is the finance approver. A webhook may carry `case_id`, `action`, `signed_by`, and `role`. `action` is `approve` or `deny`. Record the decision only when that person is the signer for the open gate. Otherwise leave the status and say who you are waiting on.

The last line of the handoff stays `I did not approve this vendor.` until a human has signed.
