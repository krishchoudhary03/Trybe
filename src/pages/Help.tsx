import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

interface FAQItem {
  question: string;
  answer: string;
  category: 'General' | 'Connections' | 'Clubs' | 'Privacy';
}

const FAQS: FAQItem[] = [
  {
    category: 'General',
    question: 'What is TRYBE?',
    answer: 'TRYBE is a student and campus networking platform designed to help you find your people, join clubs, RSVP to events, and collaborate on projects across universities.',
  },
  {
    category: 'Connections',
    question: 'Can I connect with students from other colleges?',
    answer: 'Yes! TRYBE supports cross-college networking. You can discover and connect with students from any participating university regardless of your primary college affiliation.',
  },
  {
    category: 'Clubs',
    question: 'How do I join a club?',
    answer: 'Navigate to the Clubs page or Discover page, browse the available communities, and click "Join Club". You will immediately gain access to their discussions and member list.',
  },
  {
    category: 'Privacy',
    question: 'Is my data safe on TRYBE?',
    answer: 'All profile preferences and activity logs are stored locally in your browser. We do not track or sell your information.',
  },
];

export default function Help() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [search, setSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const filteredFaqs = FAQS.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setContactSubmitted(true);
    showToast('Your message has been submitted to support.');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background text-on-background p-margin-mobile md:p-margin-desktop max-w-[1000px] mx-auto w-full">
      <div className="flex flex-col gap-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/50 pb-md">
          <div className="flex items-center gap-sm">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Help &amp; Support</h1>
              <p className="font-body-sm text-on-surface-variant">Find answers to frequently asked questions or contact our support team.</p>
            </div>
          </div>
          <Link to="/contact" className="hidden sm:flex px-md py-sm bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-colors">
            Contact Support
          </Link>
        </div>

        {/* FAQ Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-xl pr-md py-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* FAQs Accordion */}
        <div className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-md">
          <h2 className="font-headline-sm text-on-surface mb-xs">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-sm">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="border border-outline-variant/50 rounded-lg overflow-hidden bg-surface-container-low/40">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-md flex justify-between items-center font-label-md text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="material-symbols-outlined text-on-surface-variant">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-md pb-md font-body-sm text-on-surface-variant border-t border-outline-variant/30 pt-sm">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-md">
          <h2 className="font-headline-sm text-on-surface">Still need help?</h2>
          {contactSubmitted ? (
            <div className="p-md bg-primary-container/20 border border-primary/30 rounded-lg text-primary text-body-md text-center">
              Thanks! We have received your inquiry and will get back to you shortly.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={contactForm.name}
                  onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  className="bg-surface-container-low border border-outline-variant rounded-lg p-md text-on-surface focus:outline-none focus:border-primary"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  value={contactForm.email}
                  onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  className="bg-surface-container-low border border-outline-variant rounded-lg p-md text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <textarea
                placeholder="Describe your question or feedback..."
                required
                rows={4}
                value={contactForm.message}
                onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                className="bg-surface-container-low border border-outline-variant rounded-lg p-md text-on-surface focus:outline-none focus:border-primary resize-none"
              />
              <button
                type="submit"
                className="self-start px-lg py-sm bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-colors cursor-pointer"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Legal Links Footer */}
        <div className="flex flex-wrap gap-md justify-center text-label-sm text-on-surface-variant border-t border-outline-variant/30 pt-md">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link to="/guidelines" className="hover:text-primary transition-colors">Community Guidelines</Link>
        </div>
      </div>
    </div>
  );
}
