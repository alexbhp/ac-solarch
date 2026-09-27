import { loadCase, refusal } from "./_cases.js";

const ACTIONS = new Set(["approve", "deny"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, delivered: false, reason: "Use POST." });
  }

  const payload = req.body && typeof req.body === "object" ? req.body : {};
  const forwarded = {
    case_id: typeof payload.case_id === "string" ? payload.case_id : "",
    action: typeof payload.action === "string" ? payload.action : "",
    signed_by: typeof payload.signed_by === "string" ? payload.signed_by.trim() : "",
    role: typeof payload.role === "string" ? payload.role : "",
  };

  if (!ACTIONS.has(forwarded.action)) {
    return res.status(400).json({ ok: false, delivered: false, reason: "Unknown action." });
  }
  if (!forwarded.signed_by) {
    return res.status(400).json({ ok: false, delivered: false, reason: "Pick who is logged in." });
  }

  let loaded;
  try {
    loaded = await loadCase(forwarded.case_id);
  } catch {
    return res.status(502).json({ ok: false, delivered: false, reason: "The case file could not be read." });
  }
  if (loaded.error) {
    return res.status(loaded.status).json({ ok: false, delivered: false, reason: loaded.error });
  }
  const blocked = refusal(loaded.record, forwarded.signed_by);
  if (blocked) return res.status(400).json({ ok: false, delivered: false, reason: blocked });

  const url = process.env.GROK_BOT_WEBHOOK_URL;
  const key = process.env.GROK_BOT_WEBHOOK_KEY;
  if (!url || !key) {
    return res.status(200).json({
      ok: false,
      delivered: false,
      reason: "Webhook is not configured on this deployment. The decision stayed on this page.",
    });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(forwarded),
      signal: AbortSignal.timeout(10000),
    });
    const delivered = response.status === 200;
    return res.status(200).json({
      ok: delivered,
      delivered,
      reason: delivered
        ? "The Bot accepted the decision and started a run."
        : "The Bot did not start a run.",
    });
  } catch {
    return res.status(200).json({
      ok: false,
      delivered: false,
      reason: "The webhook call did not complete. The decision stayed on this page.",
    });
  }
}
