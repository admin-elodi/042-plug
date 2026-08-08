'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, X, Send, Eye, Building2, Loader2, AlertCircle, CheckCircle, MapPin, Wallet, MessageCircle, PackageOpen } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { buildWhatsAppLink } from '@/lib/whatsapp';

// Sends the platform owner a heads-up WhatsApp ping whenever a new job is
// submitted, so they know to check the admin approval queue.
const ADMIN_NOTIFY_WHATSAPP_NUMBER = '2348136573235';

interface SalariedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JobPosting {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary: string;
  description: string;
  contact_phone: string;
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];

const emptyJobFields = {
  jobTitle: '',
  companyName: '',
  location: '',
  jobType: 'Full-time',
  salary: '',
  description: '',
  contactPhone: ''
};

export const SalariedJobsModal: React.FC<SalariedJobsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'seek' | 'post'>('seek');

  // --- Posting a job ---
  const [jobData, setJobData] = useState(emptyJobFields);
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);

  // --- Browsing approved jobs ---
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [browseError, setBrowseError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || activeTab !== 'seek') return;
    let cancelled = false;

    const loadJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, job_title, company_name, location, job_type, salary, description, contact_phone')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (error) {
        console.error(error);
        setBrowseError('Could not load job listings right now. Please try again.');
      } else {
        setJobs((data as JobPosting[]) ?? []);
      }
      setLoadingJobs(false);
    };

    loadJobs();
    return () => {
      cancelled = true;
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setPostError(null);

    try {
      const { error } = await supabase.from('jobs').insert({
        job_title: jobData.jobTitle,
        company_name: jobData.companyName,
        location: jobData.location,
        job_type: jobData.jobType,
        salary: jobData.salary,
        description: jobData.description,
        contact_phone: jobData.contactPhone,
        status: 'pending'
      });

      if (error) throw error;

      // Detailed heads-up ping to the admin, mirroring every field from the
      // form so nothing has to be looked up separately in the dashboard.
      const notifyMessage =
        `Hello 042 Plug! \u{1F44B}\n\n` +
        `I would like to submit a new job vacancy for review and listing:\n\n` +
        `\u{1F4CC} *Job Title:* ${jobData.jobTitle}\n` +
        `\u{1F3E2} *Company / Business:* ${jobData.companyName}\n` +
        `\u{1F4CD} *Location:* ${jobData.location}\n` +
        `\u{1F4BC} *Job Type:* ${jobData.jobType}\n` +
        `\u{1F4B0} *Salary / Compensation:* ${jobData.salary}\n` +
        `\u{1F4DE} *Contact Phone:* ${jobData.contactPhone}\n\n` +
        `\u{1F4DD} *Job Details & Requirements:*\n${jobData.description}\n\n` +
        `---\n` +
        `Please let me know once this has been reviewed and published on the platform!`;
      window.open(buildWhatsAppLink(ADMIN_NOTIFY_WHATSAPP_NUMBER, notifyMessage), '_blank');

      setJobData(emptyJobFields);
      setPostSuccess(true);
    } catch (err) {
      console.error(err);
      setPostError(err instanceof Error ? err.message : 'Could not submit this job posting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold">Salaried Jobs Portal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 my-4 p-1 bg-stone-950 rounded-lg border border-stone-800">
          <button
            type="button"
            onClick={() => setActiveTab('seek')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'seek'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Browse jobs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('post')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'post'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Post a job</span>
          </button>
        </div>

        {/* Tab 1: Job Seekers */}
        {activeTab === 'seek' && (
          <div className="space-y-3 text-left py-2">
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 text-xs leading-relaxed">
              <p className="font-semibold text-stone-100 mb-1">{'\u{1F6E1}\u{FE0F}'} Admin-Verified Listings Only</p>
              Every job below has been reviewed and approved — none of these are unverified employer submissions.
            </div>

            {loadingJobs && (
              <div className="text-center py-10">
                <Loader2 className="w-6 h-6 text-amber-500 mx-auto mb-2 animate-spin" />
                <p className="text-xs text-stone-400">Loading jobs...</p>
              </div>
            )}

            {!loadingJobs && browseError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{browseError}</span>
              </div>
            )}

            {!loadingJobs && !browseError && jobs.length === 0 && (
              <div className="text-center py-10 text-stone-500">
                <PackageOpen className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">No approved job listings yet. Check back soon!</p>
              </div>
            )}

            {!loadingJobs && !browseError && jobs.length > 0 && (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {jobs.map((job) => (
                  <div key={job.id} className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                    <h4 className="text-sm font-bold text-white">{job.job_title}</h4>
                    <p className="text-xs text-amber-400 font-medium">{job.company_name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-stone-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{job.location}</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">{job.job_type}</span>
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        <span>{job.salary}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-2">{job.description}</p>
                    <a
                      href={buildWhatsAppLink(
                        job.contact_phone,
                        `Hi, I'd like to apply for the "${job.job_title}" role at ${job.company_name} that I saw on 042 Plug.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 mt-3 w-fit px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Apply via WhatsApp</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Employers */}
        {activeTab === 'post' && (
          <>
            {postSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">Submitted for Review!</h4>
                <p className="text-xs text-stone-400 mb-5">
                  Your job posting is pending admin approval. Once approved, it'll appear under "Browse jobs" for
                  everyone to see.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handlePostJob} className="space-y-3 text-left">
                <p className="text-xs text-stone-400 mb-2">
                  Fill in the details below. Every submission is reviewed before it goes live.
                </p>

                {postError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{postError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Senior Accountant, Retail Store Manager"
                    value={jobData.jobTitle}
                    onChange={(e) => setJobData({ ...jobData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Company / Business</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., CoalCity Ltd"
                      value={jobData.companyName}
                      onChange={(e) => setJobData({ ...jobData, companyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Independence Layout"
                      value={jobData.location}
                      onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Job Type</label>
                    <select
                      value={jobData.jobType}
                      onChange={(e) => setJobData({ ...jobData, jobType: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    >
                      {JOB_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Monthly Salary Range</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., ₦150,000 - ₦200,000"
                      value={jobData.salary}
                      onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Contact WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g., 08012345678"
                    value={jobData.contactPhone}
                    onChange={(e) => setJobData({ ...jobData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">Applicants will message this number directly.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Key Responsibilities / Qualifications</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly state job requirements..."
                    value={jobData.description}
                    onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SalariedJobsModal;