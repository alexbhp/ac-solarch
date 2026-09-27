# Enough research

Copy this checklist into `research-pack.md` frontmatter. A blank value is incomplete. `not_found` and `not_published` are complete.

```yaml
check_website: found | unreachable
check_website_evidence: fixtures/public-web/<vendor>/index.md
check_trust_page: found | not_found
check_trust_page_evidence: fixtures/public-web/<vendor>/trust.md
check_public_pricing: found | not_published
check_public_pricing_evidence: fixtures/public-web/<vendor>/pricing.md
check_data_touch_restated: yes
check_sources: yes
check_gaps: none
```

When the check is `found`, the evidence file must exist. The body then needs:

- A line `Data touch: yes` or `Data touch: no` that matches `touches_customer_data` on the case
- `## Sources` with one https URL for each found page
- `Gaps: none`, or `Gaps:` followed by what is still open

Do not list a missing private DPA as a gap. Do not list the Acme business owner as a research gap. That name is an intake field.
