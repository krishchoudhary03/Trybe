import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function Contact() {
  const navigate = useNavigate();
  const { userProfile, showToast } = useApp();

  const [form, setForm] = useState({
    name: userProfile.name || '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setSubmitted(true);
    showToast('Your message has been sent locally! We will get back to you soon.');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background text-on-background min-h-screen p-margin-mobile md:p-margin-desktop flex justify-center">
      <div className="w-full max-w-xl flex flex-col gap-lg">
        {/* Header */}
        <div className="flex items-center gap-sm border-b border-outline-variant/50 pb-md">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Contact Support</h1>
            <p className="font-body-sm text-on-surface-variant">Have questions or feedback? We'd love to hear from you.</p>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-surface border border-outline-variant rounded-xl p-xl shadow-xl"
        >
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-xl text-center gap-md">
              <div className="w-16 h-16 rounded-full bg-primary-container/30 text-primary flex items-center justify-center border border-primary-container">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h2 className="font-headline-md text-on-surface">Message Received!</h2>
              <p className="font-body-md text-on-surface-variant max-w-md">
                Thank you for reaching out, {form.name}. Our team will review your note and respond to your email ({form.email}) promptly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm(f => ({ ...f, message: '' }));
                }}
                className="mt-md px-lg py-sm rounded-lg bg-surface-container-high border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-colors font-label-md"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              <div>
                <label className="block font-label-sm text-on-surface mb-xs" htmlFor="name">Your Name *</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Alex Morgan"
                  className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-lg px-md font-body-md text-on-surface focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface mb-xs" htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="name@university.edu"
                  className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-lg px-md font-body-md text-on-surface focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface mb-xs" htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-lg px-md font-body-md text-on-surface focus:outline-none focus:border-primary transition-all"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Club Creation Request">Club Creation Request</option>
                  <option value="Partnership">Campus Partnership</option>
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-on-surface mb-xs" htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="How can we help you?"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-md font-body-md text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-xs"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                Send Message
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
