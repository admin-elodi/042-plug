-- ============================================================
-- Splits job postings into three distinct, cleanly-displayed
-- sections instead of one combined text blob: Description,
-- Key Responsibilities, and Requirements & Qualifications.
-- ============================================================

alter table jobs add column if not exists key_responsibilities text;
alter table jobs add column if not exists requirements_qualifications text;

-- Fixes the Admin Secretary listing that was posted with everything
-- jammed into one field - splits it properly into the three sections.
update jobs
set
  description = 'JungleX is looking for a reliable, organized Admin Secretary to support daily operations.',
  key_responsibilities = 'Communicate regularly with clients to update them on completed website work
Maintain records and documentation using Microsoft Word and Excel
Promote JungleX''s web development services informally - posting on your own wall, engaging in relevant comment threads, etc.
Provide general administrative support as needed',
  requirements_qualifications = 'Minimum of WAEC (SSCE)
Computer literate, with good working knowledge of Microsoft Word and Excel
Comfortable and active on social media (Facebook, Instagram, WhatsApp)
Good written and verbal communication skills
Organized, reliable, able to work with minimal supervision'
where job_title = 'Admin Secretary' and company_name = 'JungleX';
