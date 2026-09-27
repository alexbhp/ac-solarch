import { parseLedger, readRepoFile } from "./_cases.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, reason: "Use GET." });
  }
  try {
    const markdown = await readRepoFile("cases/ledger.md");
    if (!markdown) return res.status(404).json({ ok: false, reason: "The ledger is not on main yet." });
    return res.status(200).json({ ok: true, rows: parseLedger(markdown) });
  } catch {
    return res.status(502).json({ ok: false, reason: "The ledger could not be read." });
  }
}
