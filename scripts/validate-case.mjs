import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const EXPECTED = [
  { id: "VND-1101", path: "cases/VND-1101", pass: true, note: "five fields, checklist complete, waiting on Security" },
  { id: "VND-1102", path: "cases/VND-1102", pass: true, note: "research filled website and data touch, waiting on the manager" },
  { id: "VND-1103", path: "cases/VND-1103", pass: true, note: "owner missing, asked only for that field" },
  { id: "VND-9999", path: "fixtures/invalid/VND-9999", pass: false, note: "skipped Security; approved without a manager signature" },
];

const NON_HUMAN = /\b(bot|agent|grok|cursor|system)\b/i;
const REQUIRED_CASE_KEYS = [
  "case_id",
  "status",
  "vendor_legal_name",
  "website",
  "touches_customer_data",
  "business_owner",
  "target_start_date",
  "requester",
  "sources_mode",
  "research_started",
  "missing_fields",
  "security_required",
  "security_decision",
  "security_signed_by",
  "manager_required",
  "manager_decision",
  "manager_signed_by",
];

const STATUSES = new Set([
  "intake_incomplete",
  "research_gap",
  "awaiting_security",
  "awaiting_manager",
  "approved",
  "declined",
]);

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
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

function text(value) {
  return value === true || value === false ? "" : String(value ?? "").trim();
}

function isHuman(value) {
  const name = text(value);
  if (!name) return false;
  return !NON_HUMAN.test(name);
}

function missingList(value) {
  return text(value)
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && part !== "none");
}

function insideRepo(relPath) {
  if (!relPath || relPath.startsWith("/") || relPath.includes("://")) return null;
  const abs = resolve(root, relPath);
  const rel = relative(root, abs);
  if (rel.startsWith("..") || rel === "") return null;
  return abs;
}

function foundCount(pack) {
  return ["check_website", "check_trust_page", "check_public_pricing"].filter(
    (key) => pack[key] === "found",
  ).length;
}

function validateResearch(packRaw, caseData, errors) {
  const parsed = parseFrontmatter(packRaw);
  if (!parsed) {
    errors.push("research pack is missing frontmatter");
    return;
  }
  const pack = parsed.data;
  const body = parsed.body;
  const allowed = {
    check_website: ["found", "unreachable"],
    check_trust_page: ["found", "not_found"],
    check_public_pricing: ["found", "not_published"],
  };
  for (const [key, choices] of Object.entries(allowed)) {
    const value = text(pack[key]);
    if (!value) errors.push("research checklist is incomplete");
    else if (!choices.includes(value)) errors.push(`${key} has an unknown answer`);
    if (value === "found") {
      const evidence = text(pack[`${key}_evidence`]);
      const abs = insideRepo(evidence);
      if (!abs || !existsSync(abs)) errors.push(`${key} evidence file is missing`);
    }
  }
  if (pack.check_data_touch_restated !== "yes") errors.push("data touch was not restated");
  if (pack.check_sources !== "yes") errors.push("sources were not confirmed");
  const gaps = text(pack.check_gaps);
  if (!gaps) errors.push("research checklist is incomplete");
  else if (gaps === "none" && !/Gaps:\s*none\b/.test(body)) errors.push("gaps say none and the body disagrees");
  else if (gaps !== "none" && !/Gaps:\s*\S+/.test(body)) errors.push("a listed gap is missing from the body");

  const touchLine = caseData.touches_customer_data === true ? "Data touch: yes" : "Data touch: no";
  if (!body.includes(touchLine)) errors.push(`research pack must include ${touchLine}`);

  const urls = body.match(/https:\/\/\S+/g) ?? [];
  if (urls.length < foundCount(pack)) errors.push("each found page needs an https URL");
}

function validateCase(dir) {
  const errors = [];
  const casePath = join(dir, "case.md");
  if (!existsSync(casePath)) return { id: relative(root, dir), status: "", errors: ["case.md is missing"], notes: [] };
  const parsed = parseFrontmatter(readFileSync(casePath, "utf8"));
  if (!parsed) return { id: relative(root, dir), status: "", errors: ["case.md is missing frontmatter"], notes: [] };

  const data = parsed.data;
  const body = parsed.body;
  const id = text(data.case_id) || relative(root, dir);
  for (const key of REQUIRED_CASE_KEYS) {
    if (!(key in data)) errors.push(`case is missing ${key}`);
  }
  if (!STATUSES.has(text(data.status))) errors.push("status is not in the vocabulary");
  const skippedResearch =
    data.research_started === false &&
    ["awaiting_security", "awaiting_manager"].includes(text(data.status));
  if (data.research_started === true && data.sources_mode !== "mocked") {
    errors.push("sources must be labeled mocked");
  } else if (skippedResearch && data.sources_mode !== "none") {
    errors.push("sources_mode must be none when research is skipped");
  } else if (!skippedResearch && data.research_started === false && data.sources_mode !== "mocked" && data.sources_mode !== "none") {
    errors.push("sources must be labeled mocked");
  }
  if (typeof data.touches_customer_data !== "boolean") errors.push("touches_customer_data must be true or false");
  if (typeof data.research_started !== "boolean") errors.push("research_started must be true or false");
  if (typeof data.security_required !== "boolean") errors.push("security_required must be true or false");
  if (typeof data.manager_required !== "boolean") errors.push("manager_required must be true or false");

  const website = text(data.website);
  if (website && !website.startsWith("https://")) errors.push("website must be an https URL");

  for (const key of ["security_signed_by", "manager_signed_by"]) {
    if (text(data[key]) && !isHuman(data[key])) errors.push(`${key} is not a person`);
  }

  const fields = {
    vendor_legal_name: text(data.vendor_legal_name),
    website,
    business_owner: text(data.business_owner),
    target_start_date: text(data.target_start_date),
  };
  const emptyFields = Object.entries(fields)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  const missing = missingList(data.missing_fields);
  const intakeComplete = emptyFields.length === 0 && typeof data.touches_customer_data === "boolean";

  const auditPath = join(dir, "audit.md");
  if (!existsSync(auditPath)) errors.push("audit.md is missing");
  else {
    const audit = readFileSync(auditPath, "utf8");
    if (!audit.includes("## Automated")) errors.push("audit is missing Automated");
    if (!audit.includes("## Needs a person")) errors.push("audit is missing Needs a person");
  }

  const emailPath = join(dir, "approval-email.md");
  const emailExists = existsSync(emailPath);
  if (emailExists && !readFileSync(emailPath, "utf8").includes(`/approval/${id}`)) {
    errors.push("approval email is missing the case link");
  }
  const packPath = join(dir, "research-pack.md");
  const pastIntake = ["awaiting_security", "awaiting_manager", "approved", "declined"].includes(text(data.status));

  if (data.research_started === true) {
    if (!existsSync(packPath)) errors.push("research pack is missing");
    else validateResearch(readFileSync(packPath, "utf8"), data, errors);
  } else if (!skippedResearch && text(data.status) !== "intake_incomplete") {
    errors.push("research has not started");
  }

  if (!intakeComplete) {
    if (pastIntake || text(data.status) === "research_gap") {
      errors.push("approval opened before intake was complete");
    }
    if (missing.length === 0) errors.push("missing fields were not named");
    for (const field of missing) {
      if (!emptyFields.includes(field) && field !== "touches_customer_data") {
        errors.push(`${field} is listed as missing and is already filled`);
      }
    }
    if (emailExists) errors.push("approval email opened before intake was complete");
  }

  if (text(data.status) === "intake_incomplete" && intakeComplete) {
    errors.push("status is intake_incomplete and every field is present");
  }
  if (text(data.status) === "research_gap" && data.research_started !== true) {
    errors.push("research gap requires research to have started");
  }

  const securitySigned =
    data.security_decision === "approved" && isHuman(data.security_signed_by);
  const customerData = data.touches_customer_data === true;
  const managerGateOpen = ["awaiting_manager", "approved"].includes(text(data.status));

  if (customerData && data.security_required === false && (managerGateOpen || text(data.status) === "declined")) {
    errors.push("customer-data case skipped Security");
  } else if (customerData && managerGateOpen && !securitySigned) {
    errors.push("customer-data case skipped Security");
  }

  if (text(data.status) === "awaiting_security") {
    if (!customerData || data.security_required !== true) errors.push("Security was opened without a customer-data flag");
    if (data.security_decision !== "pending" || text(data.security_signed_by)) {
      errors.push("awaiting Security still has a signature");
    }
    if (!intakeComplete) errors.push("Security was opened with intake still incomplete");
  }

  if (text(data.status) === "awaiting_manager") {
    if (data.manager_decision !== "pending" || text(data.manager_signed_by)) {
      errors.push("awaiting manager still has a signature");
    }
    if (!customerData && data.security_required !== false) {
      errors.push("Security was required for a vendor that does not touch customer data");
    }
    if (!emailExists) errors.push("approval email is missing");
  }

  if (text(data.status) === "awaiting_security" && !emailExists) errors.push("approval email is missing");

  if (text(data.status) === "approved") {
    if (data.manager_required !== true || data.manager_decision !== "approved" || !isHuman(data.manager_signed_by)) {
      errors.push("status is approved without a manager signature");
    }
  }

  if (text(data.status) === "declined") {
    const someone =
      (data.security_decision === "declined" && isHuman(data.security_signed_by)) ||
      (data.manager_decision === "declined" && isHuman(data.manager_signed_by));
    if (!someone) errors.push("status is declined without a person");
  }

  if (!["approved", "declined"].includes(text(data.status))) {
    if (!body.includes(`See it in Cursor: cases/${id}/`) && !body.includes(`See it in Cursor: fixtures/invalid/${id}/`)) {
      errors.push("handoff is missing the Cursor path");
    }
    if (!body.includes("I did not approve this vendor.")) errors.push("handoff still claims the agent might have approved");
  }

  return { id, status: text(data.status), errors: [...new Set(errors)], notes: [] };
}

function report(result, expectPass) {
  const ok = result.errors.length === 0;
  const label = ok ? "PASS" : "FAIL";
  console.log(`${result.id} ${label}${result.errors.length ? "" : ""}`);
  for (const error of result.errors) console.log(`- ${error}`);
  if (expectPass === undefined) return ok ? 0 : 1;
  return ok === expectPass ? 0 : 1;
}

const arg = process.argv[2];
if (arg) {
  const dir = resolve(root, arg);
  const result = validateCase(dir);
  const code = report(result);
  process.exit(code);
}

let failed = false;
for (const item of EXPECTED) {
  const result = validateCase(resolve(root, item.path));
  const ok = result.errors.length === 0;
  const matched = ok === item.pass;
  if (!matched) failed = true;
  const verdict = matched ? "PASS" : "UNEXPECTED";
  const detail = ok ? item.note : result.errors.join("; ");
  console.log(`${result.id} ${ok ? "PASS" : "FAIL"} (${detail})`);
  if (!ok) {
    for (const error of result.errors) console.log(`- ${error}`);
  }
  if (item.id === "VND-9999") {
    for (const needle of [
      "customer-data case skipped Security",
      "status is approved without a manager signature",
    ]) {
      if (!result.errors.includes(needle)) {
        failed = true;
        console.log(`- missing expected error: ${needle}`);
      }
    }
  }
  if (!matched) console.log(`${result.id} expectation ${verdict}`);
}

console.log(failed ? "overall FAIL" : "overall PASS");
process.exit(failed ? 1 : 0);
