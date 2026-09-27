import { cp, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const slides = path.resolve("slides");
const dist = path.join(slides, "dist");
const deck = path.join(dist, "deck");
const deckIndex = path.join(deck, "index.html");

const built = await readFile(deckIndex, "utf8");
if (!built.includes("/deck/")) {
  console.error("Deck build is missing its /deck/ base.");
  process.exit(1);
}

const publicDir = path.join(slides, "public");
for (const name of await readdir(publicDir)) {
  await rm(path.join(deck, name), { recursive: true, force: true });
}

await cp(publicDir, dist, { recursive: true });
await cp(path.join(slides, "site", "index.html"), path.join(dist, "index.html"));

const home = await readFile(path.join(dist, "index.html"), "utf8");
const deckAfter = await readFile(deckIndex, "utf8");
if (!home.includes("Every path for the walkthrough")) {
  console.error("Home page was not copied to the site root.");
  process.exit(1);
}
if (deckAfter.includes("Every path for the walkthrough")) {
  console.error("The deck index was replaced by the home page.");
  process.exit(1);
}

console.log("Site root is the path list. Deck is at /deck/.");
