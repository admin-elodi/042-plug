-- ============================================================
-- 1. Optional application/backlink URL field
-- ============================================================
alter table jobs add column if not exists application_url text;

-- ============================================================
-- 2. Magic-link edit/delete system, with no login required
-- ============================================================
alter table jobs add column if not exists edit_token uuid not null default gen_random_uuid();

-- These are the ONLY way a posting can be looked up, changed, or
-- removed by its original poster. Each function checks the token
-- itself (a long random secret, effectively unguessable) rather than
-- relying on a broad table permission - so even if someone tried
-- calling the underlying table directly, they still could not
-- update/delete a job without already knowing its exact token.

create or replace function get_job_by_edit_token(p_token uuid)
returns jobs
language plpgsql
security definer
as $$
declare
  result jobs;
begin
  select * into result from jobs where edit_token = p_token;
  if not found then
    raise exception 'Invalid or expired management link.';
  end if;
  return result;
end;
$$;

create or replace function update_job_by_edit_token(
  p_token uuid,
  p_job_title text,
  p_company_name text,
  p_location text,
  p_job_type text,
  p_salary text,
  p_description text,
  p_key_responsibilities text,
  p_requirements_qualifications text,
  p_contact_phone text,
  p_application_url text
)
returns void
language plpgsql
security definer
as $$
begin
  update jobs set
    job_title = p_job_title,
    company_name = p_company_name,
    location = p_location,
    job_type = p_job_type,
    salary = p_salary,
    description = p_description,
    key_responsibilities = p_key_responsibilities,
    requirements_qualifications = p_requirements_qualifications,
    contact_phone = p_contact_phone,
    application_url = p_application_url
  where edit_token = p_token;

  if not found then
    raise exception 'Invalid or expired management link.';
  end if;
end;
$$;

create or replace function delete_job_by_edit_token(p_token uuid)
returns void
language plpgsql
security definer
as $$
begin
  delete from jobs where edit_token = p_token;
  if not found then
    raise exception 'Invalid or expired management link.';
  end if;
end;
$$;

-- PostgREST needs explicit permission to expose these as callable RPCs.
grant execute on function get_job_by_edit_token(uuid) to anon, authenticated;
grant execute on function update_job_by_edit_token(uuid, text, text, text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function delete_job_by_edit_token(uuid) to anon, authenticated;
