'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, X, Send, Eye, Building2, Loader2, AlertCircle, CheckCircle, MapPin, Wallet, MessageCircle, PackageOpen, ShieldCheck, ImagePlus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import {
  glassOverlay,
  glassCard,
  glassGlow,
  glassHeader,
  glassIconChip,
  glassIconChipLarge,
  glassCloseButton,
  glassInput,
  glassLabel,
  glassButtonPrimary,
  glassButtonSecondary,
  glassErrorBox,
  glassTabActive,
  glassTabInactive,
  glassTabContainer,
  glassDashedUpload
} from '@/styles/glassModal';

// Sends the platform owner a heads-up WhatsApp ping whenever a new job is
// submitted, so they know to check the admin approval queue.
const ADMIN_NOTIFY_WHATSAPP_NUMBER = '2348136573235';

interface SalariedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JobPosting {
  id: string;
  job_title: string | null;
  company_name: string | null;
  location: string | null;
  job_type: string | null;
  salary: string | null;
  description: string | null;
  key_responsibilities: string | null;
  requirements_qualifications: string | null;
  contact_phone: string;
  flyer_url: string | null;
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];

const emptyJobFields = {
  jobTitle: '',
  companyName: '',
  location: '',
  jobType: 'Full-time',
  salary: '',
  description: '',
  keyResponsibilities: '',
  requirementsQualifications: '',
  contactPhone: ''
};

const MAX_FLYER_SIZE_MB = 10;

// Turns a "one item per line" textarea into a clean bulleted list -
// used for both Key Responsibilities and Requirements & Qualifications,
// so employers just type naturally and the public view renders it neatly.
const BulletList: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const items = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <ul className={`space-y-1 ${className ?? ''}`}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-1.5 text-[11px] text-stone-400 leading-relaxed">
          <span className="text-amber-400 mt-0.5">&bull;</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

export const SalariedJobsModal: React.FC<SalariedJobsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'seek' | 'post'>('seek');

  // --- Posting a job ---
  const [jobData, setJobData] = useState(emptyJobFields);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  const [flyerError, setFlyerError] = useState<string | null>(null);
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
        .select(
          'id, job_title, company_name, location, job_type, salary, description, key_responsibilities, requirements_qualifications, contact_phone, flyer_url'
        )
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

  const handleFlyerSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFlyerError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFlyerError('Please upload an image file (JPG, PNG, etc.).');
      return;
    }
    if (file.size > MAX_FLYER_SIZE_MB * 1024 * 1024) {
      setFlyerError(`File is over ${MAX_FLYER_SIZE_MB}MB. Please choose a smaller image.`);
      return;
    }

    setFlyerFile(file);
    setFlyerPreview(URL.createObjectURL(file));
  };

  const removeFlyer = () => {
    if (flyerPreview) URL.revokeObjectURL(flyerPreview);
    setFlyerFile(null);
    setFlyerPreview(null);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);

    // The only real requirement: give a seeker *something* to go on -
    // either a flyer, or at minimum a job title. Every other field is
    // genuinely optional, since a flyer might already cover it.
    if (!flyerFile && !jobData.jobTitle.trim()) {
      setPostError('Please either upload a flyer or fill in at least the Job Title.');
      return;
    }

    // A loose check, not a rigid format rule - just enough digits to be a
    // real phone number, regardless of spacing, dashes, or +234 prefix.
    const digitCount = jobData.contactPhone.replace(/\D/g, '').length;
    if (digitCount < 10 || digitCount > 14) {
      setPostError('Please enter a valid WhatsApp number.');
      return;
    }

    setSubmitting(true);

    try {
      let flyerUrl: string | null = null;

      if (flyerFile) {
        const fileExt = flyerFile.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('job-flyers').upload(filePath, flyerFile);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('job-flyers').getPublicUrl(filePath);
        flyerUrl = publicUrlData.publicUrl;
      }

      // Blank fields become null rather than empty strings, so the
      // display logic elsewhere ("if job.salary") behaves correctly.
      const { error } = await supabase.from('jobs').insert({
        job_title: jobData.jobTitle.trim() || null,
        company_name: jobData.companyName.trim() || null,
        location: jobData.location.trim() || null,
        job_type: jobData.jobType || null,
        salary: jobData.salary.trim() || null,
        description: jobData.description.trim() || null,
        key_responsibilities: jobData.keyResponsibilities.trim() || null,
        requirements_qualifications: jobData.requirementsQualifications.trim() || null,
        contact_phone: jobData.contactPhone,
        flyer_url: flyerUrl,
        status: 'pending'
      });

      if (error) throw error;

      // One unified heads-up message - includes whatever was actually
      // provided, flyer note first if there is one, so the admin sees
      // the real shape of this specific submission at a glance.
      const lines = [`Hello 042 Plugs Plaza! \u{1F44B}`, '', `I would like to submit a new job vacancy for review:`, ''];
      if (flyerUrl) lines.push(`\u{1F4CE} A flyer was uploaded - check the Job Approvals dashboard to view it.`);
      if (jobData.jobTitle.trim()) lines.push(`\u{1F4CC} *Job Title:* ${jobData.jobTitle}`);
      if (jobData.companyName.trim()) lines.push(`\u{1F3E2} *Company / Business:* ${jobData.companyName}`);
      if (jobData.location.trim()) lines.push(`\u{1F4CD} *Location:* ${jobData.location}`);
      if (jobData.jobType) lines.push(`\u{1F4BC} *Job Type:* ${jobData.jobType}`);
      if (jobData.salary.trim()) lines.push(`\u{1F4B0} *Salary / Compensation:* ${jobData.salary}`);
      lines.push(`\u{1F4DE} *Contact Phone:* ${jobData.contactPhone}`);
      if (jobData.description.trim()) lines.push('', `\u{1F4DD} *Description:*\n${jobData.description}`);
      if (jobData.keyResponsibilities.trim())
        lines.push('', `\u2705 *Key Responsibilities:*\n${jobData.keyResponsibilities}`);
      if (jobData.requirementsQualifications.trim())
        lines.push('', `\u{1F393} *Requirements & Qualifications:*\n${jobData.requirementsQualifications}`);
      lines.push('', '---', `Please let me know once this has been reviewed and published on the platform!`);

      window.open(buildWhatsAppLink(ADMIN_NOTIFY_WHATSAPP_NUMBER, lines.join('\n')), '_blank');

      setJobData(emptyJobFields);
      removeFlyer();
      setPostSuccess(true);
    } catch (err) {
      console.error(err);
      setPostError(err instanceof Error ? err.message : 'Could not submit this job posting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className={glassOverlay}>
      <div className={`${glassCard} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
        <div className={glassGlow} />

        <div className={glassHeader}>
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className={glassIconChip}>
              <Briefcase className="w-4 h-4 text-amber-400" />
            </div>
            <span>Salaried Jobs Portal</span>
          </div>
          <button onClick={onClose} className={glassCloseButton}>
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="relative p-6">
          {/* Mode Selector Tabs */}
          <div className={`${glassTabContainer} mb-4`}>
            <button
              type="button"
              onClick={() => setActiveTab('seek')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'seek' ? glassTabActive : glassTabInactive
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Browse jobs</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('post')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'post' ? glassTabActive : glassTabInactive
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Post a job</span>
            </button>
          </div>

          {/* Tab 1: Job Seekers */}
          {activeTab === 'seek' && (
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/15 text-stone-300 text-xs leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-100 mb-0.5">Admin-Verified Listings Only</p>
                  Every job below has been reviewed and approved - none of these are unverified employer submissions.
                </div>
              </div>

              {loadingJobs && (
                <div className="text-center py-10">
                  <Loader2 className="w-6 h-6 text-amber-400 mx-auto mb-2 animate-spin" />
                  <p className="text-xs text-stone-400">Loading jobs...</p>
                </div>
              )}

              {!loadingJobs && browseError && (
                <div className={glassErrorBox}>
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
                    <div key={job.id} className="p-3 rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/15">
                      {job.flyer_url && (
                        <img
                          src={job.flyer_url}
                          alt={job.job_title ?? 'Job flyer'}
                          className="w-full rounded-lg mb-2.5 border border-white/10"
                        />
                      )}
                      {job.job_title && <h4 className="text-sm font-bold text-white">{job.job_title}</h4>}
                      {job.company_name && <p className="text-xs text-amber-400 font-medium">{job.company_name}</p>}
                      {(job.location || job.job_type || job.salary) && (
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-stone-400">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{job.location}</span>
                            </span>
                          )}
                          {job.job_type && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">{job.job_type}</span>
                          )}
                          {job.salary && (
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              <span>{job.salary}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {job.description && <p className="text-[11px] text-stone-300 mt-3 leading-relaxed">{job.description}</p>}

                      {job.key_responsibilities && (
                        <div className="mt-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-stone-200 mb-1.5">
                            Key Responsibilities
                          </p>
                          <BulletList text={job.key_responsibilities} />
                        </div>
                      )}

                      {job.requirements_qualifications && (
                        <div className="mt-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-stone-200 mb-1.5">
                            Requirements &amp; Qualifications
                          </p>
                          <BulletList text={job.requirements_qualifications} />
                        </div>
                      )}

                      <a
                        href={buildWhatsAppLink(
                          job.contact_phone,
                          `Hi, I'd like to apply for the "${job.job_title ?? 'position advertised on your flyer'}"${
                            job.company_name ? ` at ${job.company_name}` : ''
                          } that I saw on 042 Plugs Plaza.`
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
                  <div className={glassIconChipLarge('emerald')}>
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Submitted for Review!</h4>
                  <p className="text-xs text-stone-400 mb-5">
                    Your job posting is pending admin approval. Once approved, it'll appear under "Browse jobs" for
                    everyone to see.
                  </p>
                  <button onClick={onClose} className={glassButtonSecondary}>
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePostJob} className="space-y-3 text-left">
                  <p className="text-xs text-stone-400">
                    Fill in what you can, or upload a flyer to cover the rest - every submission is reviewed before it
                    goes live.
                  </p>

                  {postError && (
                    <div className={glassErrorBox}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{postError}</span>
                    </div>
                  )}

                  <div>
                    <label className={glassLabel}>Job Flyer (optional)</label>
                    {!flyerPreview ? (
                      <label className={glassDashedUpload}>
                        <ImagePlus className="w-4 h-4" />
                        <span>Click to upload a flyer, if you have one</span>
                        <input type="file" accept="image/*" onChange={handleFlyerSelected} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative">
                        <img src={flyerPreview} alt="Flyer preview" className="w-full rounded-xl border border-white/15" />
                        <button
                          type="button"
                          onClick={removeFlyer}
                          className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {flyerError && <p className="text-[11px] text-red-400 mt-1.5">{flyerError}</p>}
                  </div>

                  <div>
                    <label className={glassLabel}>Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Senior Accountant, Retail Store Manager"
                      value={jobData.jobTitle}
                      onChange={(e) => setJobData({ ...jobData, jobTitle: e.target.value })}
                      className={glassInput}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={glassLabel}>Company / Business</label>
                      <input
                        type="text"
                        placeholder="e.g., CoalCity Ltd"
                        value={jobData.companyName}
                        onChange={(e) => setJobData({ ...jobData, companyName: e.target.value })}
                        className={glassInput}
                      />
                    </div>
                    <div>
                      <label className={glassLabel}>Location</label>
                      <input
                        type="text"
                        placeholder="e.g., Independence Layout"
                        value={jobData.location}
                        onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                        className={glassInput}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={glassLabel}>Job Type</label>
                      <select
                        value={jobData.jobType}
                        onChange={(e) => setJobData({ ...jobData, jobType: e.target.value })}
                        className={glassInput}
                      >
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
                      <label className={glassLabel}>Monthly Salary Range</label>
                      <input
                        type="text"
                        placeholder="e.g., ₦150,000 - ₦200,000"
                        value={jobData.salary}
                        onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
                        className={glassInput}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={glassLabel}>Job Description</label>
                    <textarea
                      rows={2}
                      placeholder="A short summary naming the position - e.g., what the role is and who it's for..."
                      value={jobData.description}
                      onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                      className={`${glassInput} resize-none`}
                    />
                  </div>

                  <div>
                    <label className={glassLabel}>Key Responsibilities</label>
                    <textarea
                      rows={4}
                      placeholder={'One responsibility per line, e.g.:\nUpdate clients on project progress\nMaintain records using Word and Excel'}
                      value={jobData.keyResponsibilities}
                      onChange={(e) => setJobData({ ...jobData, keyResponsibilities: e.target.value })}
                      className={`${glassInput} resize-none`}
                    />
                    <p className="text-[10px] text-stone-500 mt-1">Each line becomes its own bullet point automatically.</p>
                  </div>

                  <div>
                    <label className={glassLabel}>Requirements &amp; Qualifications</label>
                    <textarea
                      rows={4}
                      placeholder={'One requirement per line, e.g.:\nMinimum of WAEC (SSCE)\nComputer literate (Word, Excel)'}
                      value={jobData.requirementsQualifications}
                      onChange={(e) => setJobData({ ...jobData, requirementsQualifications: e.target.value })}
                      className={`${glassInput} resize-none`}
                    />
                    <p className="text-[10px] text-stone-500 mt-1">Each line becomes its own bullet point automatically.</p>
                  </div>

                  <div>
                    <label className={glassLabel}>Contact WhatsApp Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g., 08012345678"
                      value={jobData.contactPhone}
                      onChange={(e) => setJobData({ ...jobData, contactPhone: e.target.value })}
                      className={glassInput}
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Applicants will message this number directly - this is the one field we always need.
                    </p>
                  </div>

                  <button type="submit" disabled={submitting} className={glassButtonPrimary}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SalariedJobsModal;
