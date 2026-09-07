# PEZA NARS — National Asset Registry System

Premium GIS-linked land and building registry for the Philippine Economic Zone Authority, aligned with Bureau of the Treasury NARS reporting.

## Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS
- Prisma + SQLite (PostgreSQL-ready)
- Leaflet image overlay of the CEZ Master Plan
- React Hook Form + Zod
- Print-ready NARS summary template

## Setup

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open `http://localhost:3000`.

## Demo login

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `PEZA-Admin-2026` | System Administrator |
| `encoder` | `PEZA-Encoder-2026` | Asset Encoder |
| `reviewer` | `PEZA-Reviewer-2026` | Reviewer |
| `approver` | `PEZA-Approver-2026` | Approver |
| `auditor` | `PEZA-Auditor-2026` | Auditor |

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Premium landing page |
| `/login` | Role-based sign-in |
| `/account` | Profile and password change |
| `/admin/master-data` | Reference / Master Data CRUD (Admin) |
| `/admin/users` | User management (Admin) |
| `/admin/audit` | Audit trail (Admin / Auditor) |
| `/registry` | Central property database |
| `/registry/new` | Create land / building / specialized asset |
| `/registry/[id]` | View NARS record |
| `/registry/[id]/edit` | Update record |
| `/map` | CEZ GIS asset map |
| `/reports/summary` | NARS land & building summary |

## Assets

Place the following files in `public/assets/`:

- `cez-master-plan.jpg`
- `peza-logo.png`
- `peza-building.jpg`

## Workflow

Master Data → GIS / Property Registration → Create Land or Building Record → Save → Central Property Database → Automatic NARS Summary → Search / View / Edit / Delete
