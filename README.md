# Campaign Content Operations Hub

> **Andreas Karagiannopoulos · Reform UK · Bromford & Hodge Hill · Birmingham City Council**
> **Election: 7 May 2026**

A production-ready, server-side AI content management system for local election campaigning. Generates, reviews, approves, and exports social media content packs for Facebook, Instagram, and TikTok — with human approval required before any export or scheduling.

---

## ⚠️ Important Ethical Notice

This tool:
- **Generates drafts only** — it does NOT automatically publish or post anything
- **Requires human review** before any content can be exported
- **Does not support** automated mass messaging, bots, fake engagement, or covert manipulation
- All platform API integrations are **disabled by default** and require explicit configuration + legal sign-off

---

## Stack

- **Next.js 15** App Router + TypeScript (strict)
- **Prisma** ORM + SQLite (local) / PostgreSQL (production)
- **Claude API** (Anthropic) — server-side only, key never exposed to browser
- **Zod** schema validation on all inputs and AI outputs
- **Tailwind CSS** with campaign brand theme
- **Vitest** for unit tests
- **Playwright** for E2E smoke tests

---

## Quick Start (Local Development)

### 1. Prerequisites

```bash
node --version  # v18+ required
npm --version   # v9+ required
```

### 2. Clone and install

```bash
git clone <your-repo-url>
cd campaign-hub
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add:
```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="your-key-from-console.anthropic.com"
```

### 4. Set up the database

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run type-check` | TypeScript type check |
| `npm run lint` | ESLint check |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed default campaign data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Regenerate Prisma client |

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
2. Framework: **Next.js** (auto-detected)

### 3. Set environment variables in Vercel dashboard

Required:
```
DATABASE_URL         postgresql://...   (see below)
ANTHROPIC_API_KEY    sk-ant-...
NEXTAUTH_SECRET      (generate: openssl rand -base64 32)
NEXTAUTH_URL         https://your-vercel-domain.vercel.app
```

### 4. Switch from SQLite to PostgreSQL

For Vercel, use **Vercel Postgres** (free tier) or **Neon** (free tier):

```bash
# Install PostgreSQL adapter
npm install @prisma/adapter-neon

# Update prisma/schema.prisma:
# Change: provider = "sqlite"
# To:     provider = "postgresql"

# Set DATABASE_URL in Vercel to your PostgreSQL connection string
# Then run migrations:
npx prisma migrate deploy
```

### 5. File Storage for Production

Local uploads won't persist on Vercel (ephemeral filesystem). Switch to:

**Option A: Vercel Blob** (recommended)
```bash
npm install @vercel/blob
# Set BLOB_READ_WRITE_TOKEN in Vercel env vars
```

Then update `app/api/assets/route.ts` to use `put()` from `@vercel/blob`.

**Option B: Cloudflare R2 / AWS S3**
Set the R2/S3 env vars from `.env.example` and use the `@aws-sdk/client-s3` package.

---

## Project Structure

```
campaign-hub/
├── app/
│   ├── page.tsx                  # Dashboard
│   ├── generate/page.tsx         # Content generation form
│   ├── content/page.tsx          # Review & approval workflow
│   ├── calendar/page.tsx         # Content calendar
│   ├── assets/page.tsx           # Asset upload
│   ├── hashtags/page.tsx         # Hashtag bank
│   ├── tools/page.tsx            # Free tools & workflow
│   ├── compliance/page.tsx       # Legal compliance guidance
│   └── api/
│       ├── generate-content/     # Server-side Claude API call
│       ├── content/              # Content CRUD
│       ├── review/               # Approval workflow
│       ├── export/               # CSV/JSON/MD export
│       ├── assets/               # File upload
│       └── hashtags/             # Hashtag management
├── components/
│   ├── layout/SideNav.tsx
│   └── ui/
│       ├── Toaster.tsx
│       ├── StatusBadge.tsx
│       └── CopyButton.tsx
├── lib/
│   ├── prisma.ts                 # DB client singleton
│   ├── schemas.ts                # Zod schemas & validation
│   ├── claude-prompt.ts          # AI system prompt (server only)
│   ├── rate-limit.ts             # Request rate limiting
│   ├── export.ts                 # Export formatters
│   └── platform-integrations.ts # Stubbed platform APIs
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── tests/
    ├── unit/
    │   ├── schemas.test.ts
    │   └── export.test.ts
    └── e2e/
        └── smoke.test.ts
```

---

## Content Generation Flow

```
User fills form → POST /api/generate-content
  → Validates with Zod
  → Rate limits by IP
  → Loads campaign from DB
  → Builds system prompt (server only)
  → Calls Anthropic Claude API (server only, key never in browser)
  → Parses & validates response with Zod
  → If invalid: retry with JSON repair prompt
  → Saves to DB with status: "needs_review"
  → Returns pack ID to browser

User reviews in Content Review page
  → Edit captions/hashtags/story scripts
  → Add review notes
  → Approve or reject each item

User exports approved items
  → POST /api/export with format (csv/json/markdown)
  → Only approved items can be exported
  → Items marked as "exported"
  → File downloaded to browser

User manually schedules in Meta Business Suite / Buffer / TikTok Creator Studio
```

---

## Platform API Integration Status

| Platform | Status | How to Enable |
|----------|--------|---------------|
| Facebook | ⛔ Disabled | Set `META_PAGE_ACCESS_TOKEN` + `META_PAGE_ID` |
| Instagram | ⛔ Disabled | Set `META_PAGE_ACCESS_TOKEN` + `META_PAGE_ID` |
| TikTok | ⛔ Disabled | Set `TIKTOK_ACCESS_TOKEN` |
| Buffer | ⛔ Disabled | Set `BUFFER_API_KEY` |

> **Warning:** Enabling platform APIs requires developer account approval, OAuth setup, legal compliance review, and explicit user action. Never configure without these steps.

---

## Security Notes

- `ANTHROPIC_API_KEY` is accessed only in `/app/api/` routes (server-side)
- All API inputs validated with Zod before processing
- File uploads: type-checked, size-limited, filename sanitized
- Rate limiting on the generation endpoint (5 requests/minute by default)
- No `dangerouslySetInnerHTML` usage
- No API keys in client code

---

## Known Limitations

1. **Rate limiting** uses in-memory store — resets on server restart. Use Redis/Upstash for production multi-instance deployments.
2. **File uploads** use local filesystem — not suitable for Vercel without cloud storage configured.
3. **SQLite** is not suitable for concurrent production traffic — use PostgreSQL.
4. **Platform API posting** is fully stubbed — requires significant additional development, credentials, and legal review before use.
5. **Authentication** — no user auth system is included. Add NextAuth.js or Clerk before exposing to the internet.

---

## Electoral Commission Resources

- [Local elections candidate guidance](https://www.electoralcommission.org.uk/i-am-a/candidate-or-agent/local-elections-england)
- [Digital campaigning guidance](https://www.electoralcommission.org.uk/guidance-political-parties/digital-campaigning)
- [Campaign spending limits](https://www.electoralcommission.org.uk/guidance-political-parties/campaign-spending/candidates)

---

*This tool provides drafts for human review. It is not legal advice. Always consult the Electoral Commission and your legal team before publishing campaign materials.*
