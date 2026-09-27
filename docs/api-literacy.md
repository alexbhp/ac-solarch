# Grok API crib

No API call is built in this repo. This is the live conversation if someone asks where the API would enter.

The bot stays the front door. The case file stays the record. The API would fill that same case. It would not decide `approved` or `declined`.

## Where it would enter

An ITSM webhook, or a volume job that fills research packs, would call the API from a service you run. The service executes tools. The model does not hold the side effects.

Useful tools on that service: `save_pack` and `set_status`. `set_status` accepts only `intake_incomplete`, `research_gap`, `awaiting_security`, and `awaiting_manager`. The service refuses `approved` and `declined` and runs `scripts/validate-case.mjs` on the write.

## Call

`POST https://api.x.ai/v1/responses`

`Authorization: Bearer $XAI_API_KEY`

Model: `grok-4.6` (500k context). OpenAI-compatible SDKs work against this endpoint.

An inference key calls the model. A management key, with explicit permissions, is what Collections and file tools need. The key lives in the service environment. It does not go in git, and it does not go on the shared bot computer.

## Tools

`web_search` runs server-side. `allowed_domains` holds at most five domains.

Function calling: the model requests a tool, the service runs it, and the service returns `function_call_output`. The model does not execute the tool itself.

## Rate

`grok-4.6` tier T0 is about 150 requests per second and 50 million tokens per minute, and the ceiling scales with spend tier. A 429 waits with exponential backoff. Per-key QPS and TPM limits are possible.

Batch API is discounted, typically finishes within 24 hours, and does not count against the realtime rate limit.

## Cost

Under 200k prompt tokens, the published ballpark is about $2 per million input tokens, $0.50 cached, and $6 per million output tokens. At 200k prompt tokens or above, those rates double for the whole request. Confirm the live pricing page before quoting a number in the room. Do not quote web-search tool dollars from memory.

Chat Completions can send a prompt cache hint with `x-grok-conv-id`. The Responses API uses `prompt_cache_key`.

## What you say

The API is how a ticket system or a batch job would do the same intake and pack fill the bot does in conversation. Auth is a bearer key on a service. Rate limits are answered with backoff. Cost jumps once the prompt crosses 200k tokens. The approval decision stays with Marcus or Riley, on `/approval/`, either way.
