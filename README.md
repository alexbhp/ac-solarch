# Acme vendor onboarding

A thin take-home for Maya Chen's process: intake, a public research pack, then approval routing. Grok Bot is the front door. The case files in this repo are the record. No Grok API call is built.

Acme, Contoso, Initech, and Globex are fictional. The vendor pages under `fixtures/public-web/` are mocked. Say that in the room.

## Run

```bash
npm install
npm run validate
npm run dev
```

`npm run validate` passes VND-1101, VND-1102, and VND-1103, and fails VND-9999. A path argument exits 1 when that case is illegal:

```bash
node scripts/validate-case.mjs fixtures/invalid/VND-9999
```

The deck source is `slides/slides.md`. The built site also serves:

- `/dataset/` — three requester messages, with a copy button on each field
- `/approval/` — Logged in as, then approve, deny, or more information
- `/ops/` — every submission, automated against what still needs a person

## Bot

Create one Vendor Intake bot and paste `bot/vendor-intake-bot.md`. The walkthrough is `bot/demo-script.md`. Project rules do not load into the bot by themselves.

On that bot, add a webhook routine. Put its POST URL and key in the Vercel project as `GROK_BOT_WEBHOOK_URL` and `GROK_BOT_WEBHOOK_KEY`. Names only are in `.env.example`. The key does not go in git.

Deploy the site with:

```bash
npx vercel deploy --yes --scope alexbhp
```

## If they ask about the API

`docs/api-literacy.md` is the crib. The API would fill this same case from a service. It would not approve a vendor, and it would not replace the bot.
