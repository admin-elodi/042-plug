-- ============================================================
-- WhatsApp group partner splits
-- ============================================================

create table if not exists partner_groups (
  id                uuid primary key default gen_random_uuid(),
  group_name        text not null,
  referral_code     text not null unique,   -- used as ?ref=<code> in shareable links
  subaccount_code   text not null,           -- from Paystack Dashboard → Subaccounts, after creating one for this group's admin
  split_percentage  numeric,                 -- stored for reference/display only — the actual split is enforced by Paystack based on how the subaccount itself was configured
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

alter table partner_groups enable row level security;

-- Only the platform owner can manage partner groups — this determines
-- real money splits, so it's admin-only in every direction.
create policy "Only owner can manage partner groups"
  on partner_groups for all
  using (auth.jwt() ->> 'email' = 'ikezion@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ikezion@gmail.com');

-- Tracks which partner group (if any) referred a given shop, so payment
-- can be split with the right subaccount at checkout time.
alter table shops add column if not exists referred_by_group_id uuid references partner_groups(id);
