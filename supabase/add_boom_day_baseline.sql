-- ============================================================
-- Aftermath tracking: a baseline snapshot of total views across
-- the category's shops, taken the moment a Boom Day is scheduled
-- — so we can honestly show how many views were actually gained
-- since the campaign began, not just guess.
-- ============================================================

alter table boom_days add column if not exists baseline_view_count integer not null default 0;
