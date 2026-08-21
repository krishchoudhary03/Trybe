import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'guidelines';
}

export default function LegalPage({ type }: LegalPageProps) {
  const navigate = useNavigate();

  const titleMap = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    guidelines: 'Community Guidelines',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background text-on-background min-h-screen p-margin-mobile md:p-margin-desktop flex justify-center">
      <div className="w-full max-w-3xl flex flex-col gap-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/50 pb-md">
          <div className="flex items-center gap-sm">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">{titleMap[type]}</h1>
          </div>
          <Link to="/home" className="text-primary font-label-md hover:underline flex items-center gap-xs">
            Back to Home
          </Link>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-surface border border-outline-variant rounded-xl p-xl flex flex-col gap-lg text-on-surface-variant font-body-md leading-relaxed"
        >
          {type === 'privacy' && (
            <>
              <p className="text-on-surface font-body-lg">
                At TRYBE, we prioritize your privacy and are committed to protecting your personal data within your student and college community.
              </p>
              <section className="flex flex-col gap-xs">
                <h2 className="font-headline-sm text-on-surface">1. Data We Collect</h2>
                <p>
                  We collect information you provide directly to us when creating an account, editing your profile, connecting with peers, joining clubs, or posting content. This includes your name, college affiliation, email address, skills, interests, and activity logs.
                </p>
              </section>
              <section className="flex flex-col gap-xs">
                <h2 className="font-headline-sm text-on-surface">2. How We Use Your Data</h2>
                <p>
                  Your information is used solely to match you with relevant peers, clubs, events, and campus discussions. We do not sell your personal data to third parties.
                </p>
              </section>
              <section className="flex flex-col gap-xs">
                <h2 className="font-headline-sm text-on-surface">3. Privacy Controls &amp; Storage</h2>
                <p>
                  In this MVP version, your profile and interaction preferences are stored locally in your browser session for maximum speed and privacy. You can reset or update your data at any time from your Profile or Settings.
                </p>
              </section>
            </>
          )}

          {type === 'terms' && (
            <>
              <p className="text-on-surface font-body-lg">
                Welcome to TRYBE. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service.
              </p>
              <section className="flex flex-col gap-xs">
                <h2 className="font-headline-sm text-on-surface">1. Account Eligibility</h2>
                <p>
                  TRYBE is intended for verified students, faculty, and alumni. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                </p>
              </section>
              <section className="flex flex-col gap-xs">
                <h2 className="font-headline-sm text-on-surface">2. Respectful Conduct</h2>
                <p>
                  Users must treat all members of the TRYBE community with respect. Spam, harassment, hate speech, illegal activities, and unauthorized commercial solicitation are strictly prohibited.
                </p>
              </section>
              <section className="flex flex-col gap-xs">
                <h2 className="font-headline-sm text-on-surface">3. Content Rights</h2>
                <p>
                  You retain ownership of the posts, projects, and media you share on TRYBE. By publishing content, you grant TRYBE a non-exclusive license to display it within your college community.
                </p>
              </section>
            </>
          )}

          {type === 'guidelines' && (
            <>
              <p className="text-on-surface font-body-lg">
                TRYBE is designed to foster genuine human connections, collaboration, and learning across universities.
              </p>
              <section className="flex flex-col gap-xs">
                <h2 className="font-headline-sm text-on-surface">1. Be Authentic &amp; Inclusive</h2>
                <p>
                  Use your real identity and college credentials. Be welcoming to students from all universities, departments, and backgrounds.
                </p>
              </section>
              <section className="flex flex-col gap-xs">
                <h2 className="font-headline-sm text-on-surface">2. Supportive Collaboration</h2>
                <p>
                  Whether helping someone with #AssignmentHelp or reviewing a student project, provide constructive feedback and foster a culture of growth.
                </p>
              </section>
              <section className="flex flex-col gap-xs">
                <h2 className="font-headline-sm text-on-surface">3. Campus Safety</h2>
                <p>
                  Do not share confidential exam material, private personal information of others (doxxing), or misinformation. Report inappropriate behavior immediately.
                </p>
              </section>
            </>
          )}

          <div className="pt-md border-t border-outline-variant/30 flex justify-between items-center text-label-sm text-on-surface-variant">
            <span>Last updated: August 2026</span>
            <span>TRYBE Inc.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
