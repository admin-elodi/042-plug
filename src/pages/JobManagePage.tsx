'use client';

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Loader2, AlertCircle, CheckCircle, Trash2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];

interface JobRecord {
  job_title: string | null;
  company_name: string | null;
  location: string | null;
  job_type: string | null;
  salary: string | null;
  description: string | null;
  key_responsibilities: string | null;
  requirements_qualifications: string | null;
  application_url: string | null;
  contact_phone: string;
  status: 'pending' | 'approved';
}

const inputClass =
  'w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-500';
const labelClass = 'block text-xs text-stone-400 mb-1';

export const JobManagePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = 'Manage Job Posting | 042 Plugs Plaza';
  }, []);

  useEffect(() => {
    if (!token) return;

    const loadJob = async () => {
      const { data, error } = await supabase.rpc('get_job_by_edit_token', { p_token: token });
      if (error || !data) {
        setNotFound(true);
      } else {
        setJob(data as JobRecord);
      }
      setLoading(false);
    };

    loadJob();
  }, [token]);

  const update = (field: keyof JobRecord, value: string) => {
    if (!job) return;
    setJob({ ...job, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !token) return;
    setSaving(true);
    setErrorMsg(null);
    setSaved(false);

    try {
      const { error } = await supabase.rpc('update_job_by_edit_token', {
        p_token: token,
        p_job_title: job.job_title?.trim() || null,
        p_company_name: job.company_name?.trim() || null,
        p_location: job.location?.trim() || null,
        p_job_type: job.job_type || null,
        p_salary: job.salary?.trim() || null,
        p_description: job.description?.trim() || null,
        p_key_responsibilities: job.key_responsibilities?.trim() || null,
        p_requirements_qualifications: job.requirements_qualifications?.trim() || null,
        p_contact_phone: job.contact_phone,
        p_application_url: job.application_url?.trim() || null
      });

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!confirm('Take down this job posting permanently? This cannot be undone.')) return;
    setDeleting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.rpc('delete_job_by_edit_token', { p_token: token });
      if (error) throw error;
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not remove this posting. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plugs Plaza</span>
        </Link>

        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
          <Briefcase className="w-5 h-5 text-amber-500" />
          <span>Manage Your Job Posting</span>
        </div>

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-spin" />
            <p className="text-xs text-stone-400">Loading your posting...</p>
          </div>
        )}

        {!loading && notFound && (
          <div className="text-center py-20">
            <AlertCircle className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">This link isn't valid</h3>
            <p className="text-xs text-stone-400">
              It may have been used to already delete this posting, or the link was copied incorrectly.
            </p>
          </div>
        )}

        {!loading && job && (
          <>
            <div className="mb-5 flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  job.status === 'approved'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
              >
                {job.status === 'approved' ? 'Live' : 'Pending Approval'}
              </span>
              <span className="text-[11px] text-stone-500">
                {job.status === 'approved'
                  ? 'Changes you save here go live immediately, no re-approval needed.'
                  : 'Still waiting on admin approval.'}
              </span>
            </div>

            {errorMsg && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {saved && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Changes saved.</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className={labelClass}>Job Title</label>
                <input
                  type="text"
                  value={job.job_title ?? ''}
                  onChange={(e) => update('job_title', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Company / Business</label>
                  <input
                    type="text"
                    value={job.company_name ?? ''}
                    onChange={(e) => update('company_name', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    type="text"
                    value={job.location ?? ''}
                    onChange={(e) => update('location', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Job Type</label>
                  <select value={job.job_type ?? ''} onChange={(e) => update('job_type', e.target.value)} className={inputClass}>
                    <option value="" className="bg-stone-900">
                      Not specified
                    </option>
                    {JOB_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-stone-900">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Monthly Salary Range</label>
                  <input
                    type="text"
                    value={job.salary ?? ''}
                    onChange={(e) => update('salary', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Job Description</label>
                <textarea
                  rows={2}
                  value={job.description ?? ''}
                  onChange={(e) => update('description', e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass}>Key Responsibilities (one per line)</label>
                <textarea
                  rows={4}
                  value={job.key_responsibilities ?? ''}
                  onChange={(e) => update('key_responsibilities', e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass}>Requirements &amp; Qualifications (one per line)</label>
                <textarea
                  rows={4}
                  value={job.requirements_qualifications ?? ''}
                  onChange={(e) => update('requirements_qualifications', e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass}>Application / More Info Link</label>
                <input
                  type="url"
                  value={job.application_url ?? ''}
                  onChange={(e) => update('application_url', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Contact WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  value={job.contact_phone}
                  onChange={(e) => update('contact_phone', e.target.value)}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-semibold text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-stone-800">
              <p className="text-xs text-stone-500 mb-3">Done with this posting, or the role's been filled?</p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 disabled:opacity-60 text-red-300 font-semibold text-sm border border-red-500/30"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{deleting ? 'Removing...' : 'Take Down This Posting'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobManagePage;
