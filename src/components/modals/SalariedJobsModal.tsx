'use client';

import React, { useState } from 'react';
import { Briefcase, X, Send, Eye, Building2 } from 'lucide-react';

// CHANGE THIS: Replace with your actual WhatsApp phone number in international format (e.g., '2348012345678')
const VERIFICATION_WHATSAPP_NUMBER = '2348000000000';

interface SalariedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalariedJobsModal: React.FC<SalariedJobsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'seek' | 'post'>('seek');

  // Form State for Employers Posting a Job
  const [jobData, setJobData] = useState({
    jobTitle: '',
    companyName: '',
    location: '',
    salary: '',
    description: '',
  });

  if (!isOpen) return null;

  const handlePostJobToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    const message =
      `Hello! I would like to submit a salaried job posting for verification on 042Plug.\n\n` +
      `📌 *Job Title:* ${jobData.jobTitle}\n` +
      `🏢 *Company/Business:* ${jobData.companyName}\n` +
      `📍 *Location:* ${jobData.location}\n` +
      `💰 *Monthly Salary:* ${jobData.salary}\n` +
      `📝 *Description:* ${jobData.description}\n\n` +
      `Please review and publish this job vacancy.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${VERIFICATION_WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Redirect to WhatsApp
    window.open(whatsappUrl, '_blank');

    // Reset and close modal
    setJobData({ jobTitle: '', companyName: '', location: '', salary: '', description: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl p-6 overflow-hidden">
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
            <span>Browse Vacancies</span>
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
            <span>Post a Vacancy</span>
          </button>
        </div>

        {/* Tab 1: Job Seekers */}
        {activeTab === 'seek' && (
          <div className="space-y-4 text-left py-2">
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 text-xs leading-relaxed">
              <p className="font-semibold text-stone-100 mb-1">🛡️ Admin-Verified Listings Only</p>
              Job seekers can only view active vacancies that have been submitted by employers and verified by our admins.
            </div>
            <p className="text-stone-400 text-xs">
              Looking for available roles in Coal City? Tap below to view live postings.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-lg"
            >
              View Active Verified Vacancies
            </button>
          </div>
        )}

        {/* Tab 2: Employers */}
        {activeTab === 'post' && (
          <form onSubmit={handlePostJobToWhatsApp} className="space-y-3 text-left">
            <p className="text-xs text-stone-400 mb-2">
              Fill in the details below. Submitting will open WhatsApp to send your job post directly to our verification team.
            </p>

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

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Key Responsibilities / Description</label>
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
              className="w-full mt-2 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Send Job to WhatsApp for Verification</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SalariedJobsModal;