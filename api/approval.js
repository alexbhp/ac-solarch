const OPEN = new Set(["VND-1101", "VND-1102"]);
const ACTIONS = new Set(["approve", "deny", "more_info"]);

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
    note: typeof payload.note === "string" ? payload.note.trim() : "",
  };

  if (!OPEN.has(forwarded.case_id)) {
    return res.status(400).json({
      ok: false,
      delivered: false,
      reason: "This case cannot take a decision.",
    });
  }
  if (!ACTIONS.has(forwarded.action)) {
    return res.status(400).json({ ok: false, delivered: false, reason: "Unknown action." });
  }
  if (!forwarded.signed_by) {
    return res.status(400).json({ ok: false, delivered: false, reason: "Pick who is logged in." });
  }
  if (forwarded.action === "more_info" && !forwarded.note) {
    return res.status(400).json({
      ok: false,
      delivered: false,
      reason: "Say what information you still need.",
    });
  }

  const url = process.env.GROK_BOT_WEBHOOK_URL;
  const key = process.env.GROK_BOT_WEBHOOK_KEY;
  if (!url || !key) {
    return res.status(200).json({
      ok: false,
      delivered: false,
      reason: "Webhook is not configured on this deployment. The decision stayed on this page.",
      payload: forwarded,
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
