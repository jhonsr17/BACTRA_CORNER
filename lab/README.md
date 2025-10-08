# BACTRA LAB (MVP)

Minimal React + Vite + TypeScript app to create microbiology cases, simulate species detection, and forward cases to BACTRA MED.

## Scripts
- npm run dev
- npm run build
- npm run preview

## Env
Create `.env` from `.env.example` and set your Supabase credentials.

## SQL (run in Supabase)
```sql
create extension if not exists pgcrypto;

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  patient_ref text not null,
  indole boolean not null,
  motility boolean not null,
  detected_species text,
  forwarded_to_med boolean default false,
  created_at timestamptz default now()
);
```

## Routes
- / → NewCase
- /capture/:id → Capture
- /result/:id → Result
