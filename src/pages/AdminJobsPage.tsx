'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Loader2, AlertCircle, CheckCircle, Trash2, MapPin, Wallet, Phone, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/modals/AuthModal';

const ADMIN_EMAIL = 'ikezion@gmail.com';

interface JobPosting {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary: string;
  description: string;
  contact_phone: string;
  status: 'pending' | 'approved';
}

export const AdminJobsPage: React.FC = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, job_title, company_name, location, job_type, salary, description, contact_phone, status')
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error(error);
        setErrorMsg('Could not load job postings. Please try again.');
      } else {
        setJobs((data as JobPosting[]) ?? []);
        setErrorMsg(null);
      }
      setLoading(false);
    };

    loadJobs();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    document.title = 'Job Approvals | 042 Plug';
  }, []);

  const handleApprove = async (jobId: string) => {
    setBusyId(jobId);
    setErrorMsg(null);
    try {
      const { error } = await supabase.from('jobs').update({ status: 'approved' }).eq('id', jobId);
      if (error) throw error;
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'approved' } : j)));
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not approve this job.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (job: JobPosting) => {
    if (!confirm(`Delete "${job.job_title}" at ${job.company_name}? This cannot be undone.`)) return;
    setBusyId(job.id);
    setErrorMsg(null);
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', job.id);
      if (error) throw error;
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not delete this job.');
    } finally {
      setBusyId(null);
    }
  };

  const pendingJobs = jobs.filter((j) => j.status === 'pending');
  const approvedJobs = jobs.filter((j) => j.status === 'approved');

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plugs</span>
        </Link>

        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span>Job Approvals</span>
        </div>

        {!user && (
          <div className="text-center py-20">
            <LogIn className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Sign in to manage job approvals</h3>
            <button
              onClick={() => setShowAuthModal(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold"
            >
              Sign In
            </button>
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
          </div>
        )}

        {user && !isAdmin && (
          <div className="text-center py-20">
            <ShieldCheck className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">This page is only for the platform owner</h3>
            <p className="text-xs text-stone-400">Signed in as {user.email}</p>
          </div>
        )}

        {user && isAdmin && (
          <>
            {errorMsg && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loading && (
              <div className="text-center py-20">
                <Loader2 className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-spin" />
                <p className="text-xs text-stone-400">Loading job postings...</p>
              </div>
            )}

            {!loading && (
              <div className="space-y-8">
                {/* Pending */}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">
                    Pending Approval ({pendingJobs.length})
                  </h2>
                  {pendingJobs.length === 0 ? (
                    <p className="text-xs text-stone-500">Nothing waiting for review right now.</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingJobs.map((job) => (
                        <div key={job.id} className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
                          <h3 className="text-sm font-bold text-white">{job.job_title}</h3>
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
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{job.contact_phone}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-2">{job.description}</p>

                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleApprove(job.id)}
                              disabled={busyId === job.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold disabled:opacity-50"
                            >
                              {busyId === job.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleDelete(job)}
                              disabled={busyId === job.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Approved */}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">
                    Live on the Site ({approvedJobs.length})
                  </h2>
                  {approvedJobs.length === 0 ? (
                    <p className="text-xs text-stone-500">No approved jobs yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {approvedJobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between gap-2 rounded-lg border border-stone-800 bg-stone-900/40 p-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{job.job_title}</p>
                            <p className="text-[11px] text-stone-400 truncate">{job.company_name} · {job.location}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(job)}
                            disabled={busyId === job.id}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-stone-800 hover:bg-red-500/20 hover:text-red-300 text-stone-300 text-[10px] font-medium disabled:opacity-50 whitespace-nowrap"
                          >
                            {busyId === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            <span>Remove</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminJobsPage;