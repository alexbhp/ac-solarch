import { loadCase } from "./_cases.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, reason: "Use GET." });
  }
  const id = typeof req.query?.id === "string" ? req.query.id : "";
  try {
    const loaded = await loadCase(id);
    if (loaded.error) return res.status(loaded.status).json({ ok: false, reason: loaded.error });
    return res.status(200).json({ ok: true, case: loaded.record });
  } catch {
    return res.status(502).json({ ok: false, reason: "The case file could not be read." });
  }
}
