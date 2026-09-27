const REPO = "https://raw.githubusercontent.com/alexbhp/ac-solarch/main";
const CASE_ID = /^VND-\d+$/;
const NON_HUMAN = /\b(bot|agent|grok|cursor|system)\b/i;

export function parseFrontmatter(raw) {
  const match = String(raw).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value === "true") value = true;
    else if (value === "false") value = false;
    data[key] = value;
  }
  return { data, body: raw.slice(match[0].length).replace(/^\r?\n/, "") };
}

export function parseLedger(markdown) {
  const rows = [];
  for (const line of String(markdown).split(/\r?\n/)) {
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (!CASE_ID.test(cells[0] || "")) continue;
    rows.push({
      case_id: cells[0],
      vendor: cells[1] || "",
      status: cells[2] || "",
      automated: cells[3] || "",
      needs_person: cells[4] || "",
    });
  }
  return rows;
}

export async function readRepoFile(relPath) {
  const response = await fetch(`${REPO}/${relPath}`, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  return response.text();
}

function text(value) {
  return value === true || value === false ? "" : String(value ?? "").trim();
}

export function ownerName(businessOwner) {
  return text(businessOwner).split(",")[0].trim();
}

export async function loadCase(id) {
  if (!CASE_ID.test(id)) return { status: 400, error: "Unknown case." };
  const raw = await readRepoFile(`cases/${id}/case.md`);
  if (!raw) return { status: 404, error: "This case is not on main yet." };
  const parsed = parseFrontmatter(raw);
  if (!parsed) return { status: 422, error: "This case file has no frontmatter." };
  const email = await readRepoFile(`cases/${id}/approval-email.md`);
  const data = parsed.data;
  const missing = ["vendor_legal_name", "website", "business_owner", "target_start_date"].filter(
    (key) => !text(data[key]),
  );
  if (typeof data.touches_customer_data !== "boolean") missing.push("touches_customer_data");
  const status = text(data.status);
  const ready =
    missing.length === 0 &&
    (status === "awaiting_security" || status === "awaiting_manager") &&
    Boolean(email && email.includes(`/approval/${id}`));
  return {
    status: 200,
    record: {
      case_id: id,
      vendor_legal_name: text(data.vendor_legal_name),
      website: text(data.website),
      touches_customer_data: data.touches_customer_data === true,
      business_owner: text(data.business_owner),
      target_start_date: text(data.target_start_date),
      status,
      ready,
      missing,
      email: email || "",
      gate:
        status === "awaiting_security"
          ? "Awaiting Security"
          : status === "awaiting_manager"
            ? "Awaiting the manager"
            : status,
    },
  };
}

export function refusal(record, signedBy) {
  const name = text(signedBy);
  if (!name || NON_HUMAN.test(name)) return "A signer must be a person.";
  if (name === ownerName(record.business_owner)) return "The business owner cannot sign this vendor.";
  if (!record.ready) return "This case is not waiting for a decision.";
  if (record.status === "awaiting_security" && name !== "Marcus Adeyemi") {
    return "Marcus Adeyemi signs Security.";
  }
  if (record.status === "awaiting_manager" && name !== "Riley Chen") {
    return "Riley Chen signs the manager gate.";
  }
  return "";
}
