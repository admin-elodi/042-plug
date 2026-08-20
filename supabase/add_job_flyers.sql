-- ============================================================
-- Flyer-based job postings - lets an employer upload a flyer
-- image instead of typing every field manually. Contact phone
-- stays required (needed for the Apply via WhatsApp button);
-- everything else becomes optional once a flyer is attached.
-- ============================================================

alter table jobs add column if not exists flyer_url text;

alter table jobs alter column job_title drop not null;
alter table jobs alter column company_name drop not null;
alter table jobs alter column location drop not null;
alter table jobs alter column salary drop not null;
alter table jobs alter column job_type drop not null;
alter table jobs alter column description drop not null;

-- Either a flyer OR a real job title must be present - never a
-- completely empty posting either way.
alter table jobs add constraint jobs_has_content
  check (flyer_url is not null or job_title is not null);
