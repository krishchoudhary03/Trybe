import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';

function safeParseStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export default function Settings() {
  const navigate = useNavigate();
  const { userProfile, updateUserProfile, logout, showToast } = useApp();

  const [activeSection, setActiveSection] = useState<'profile' | 'account' | 'notifications' | 'privacy' | 'appearance'>('profile');

  // Persisted local settings
  const [emailNotifications, setEmailNotifications] = useState(() => safeParseStorage('trybee_settings_email', true));
  const [pushNotifications, setPushNotifications] = useState(() => safeParseStorage('trybee_settings_push', true));
  const [publicProfile, setPublicProfile] = useState(() => safeParseStorage('trybee_settings_public', true));

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('trybee_settings_email', JSON.stringify(emailNotifications));
  }, [emailNotifications]);

  useEffect(() => {
    localStorage.setItem('trybee_settings_push', JSON.stringify(pushNotifications));
  }, [pushNotifications]);

  useEffect(() => {
    localStorage.setItem('trybee_settings_public', JSON.stringify(publicProfile));
  }, [publicProfile]);

  const handleExportData = () => {
    try {
      const data = {
        userProfile,
        joinedClubs: Array.from(safeParseStorage<string[]>('trybee_joinedClubs', [])),
        connections: safeParseStorage('trybee_connections', {}),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trybee-data-export-${userProfile.username}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Your TRYBE data export has downloaded!');
    } catch {
      showToast('Failed to export data', 'error');
    }
  };

  const handleSavePassword = () => {
    if (!currentPassword.trim()) {
      showToast('Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    showToast('Password updated successfully!');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background text-on-background p-margin-mobile md:p-margin-desktop max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col gap-lg">
        {/* Header */}
        <div className="border-b border-outline-variant/50 pb-md flex justify-between items-end">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Settings</h1>
            <p className="font-body-sm text-on-surface-variant">Manage your account preferences, privacy, and notifications.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg items-start">
          {/* Navigation Sidebar */}
          <nav className="flex flex-col gap-xs w-full">
            {[
              { id: 'profile', label: 'Profile Settings', icon: 'person' },
              { id: 'account', label: 'Account & Security', icon: 'security' },
              { id: 'notifications', label: 'Notifications', icon: 'notifications' },
              { id: 'privacy', label: 'Privacy & Sharing', icon: 'lock' },
              { id: 'appearance', label: 'Appearance', icon: 'palette' },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`flex items-center gap-sm px-md py-sm rounded-lg font-label-md transition-colors text-left cursor-pointer w-full ${
                  activeSection === sec.id
                    ? 'bg-primary-container/20 text-primary border-l-4 border-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{sec.icon}</span>
                {sec.label}
              </button>
            ))}
          </nav>

          {/* Settings Section Content */}
          <div className="md:col-span-3 w-full">
            {activeSection === 'profile' && (
              <div className="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl flex flex-col gap-lg w-full shadow-sm">
                <div className="border-b border-outline-variant/30 pb-sm">
                  <h2 className="font-headline-sm text-on-surface">Profile Details</h2>
                  <p className="font-body-sm text-on-surface-variant text-[13px] mt-xs">Update your public student profile information</p>
                </div>
                <div className="flex flex-col gap-md w-full">
                  <div className="w-full">
                    <label htmlFor="settings-name" className="block font-label-sm text-on-surface mb-xs font-medium">Display Name</label>
                    <input
                      id="settings-name"
                      type="text"
                      value={userProfile.name}
                      onChange={e => updateUserProfile({ name: e.target.value }, true)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="w-full">
                    <label htmlFor="settings-college" className="block font-label-sm text-on-surface mb-xs font-medium">College / University</label>
                    <input
                      id="settings-college"
                      type="text"
                      value={userProfile.college}
                      onChange={e => updateUserProfile({ college: e.target.value }, true)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="w-full">
                    <label htmlFor="settings-bio" className="block font-label-sm text-on-surface mb-xs font-medium">Bio</label>
                    <textarea
                      id="settings-bio"
                      value={userProfile.bio}
                      onChange={e => updateUserProfile({ bio: e.target.value }, true)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-md text-on-surface focus:outline-none focus:border-primary h-28 resize-none transition-colors"
                    />
                  </div>
                  <div className="pt-sm">
                    <button
                      onClick={() => showToast('Profile details updated successfully!')}
                      className="px-lg py-sm bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl flex flex-col gap-lg w-full shadow-sm">
                <div className="border-b border-outline-variant/30 pb-sm">
                  <h2 className="font-headline-sm text-on-surface">Account &amp; Security</h2>
                  <p className="font-body-sm text-on-surface-variant text-[13px] mt-xs">Manage credentials, export data, or deactivate account</p>
                </div>
                <div className="flex flex-col gap-md w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-md border border-outline-variant/50 rounded-lg gap-sm bg-surface-container-low/30">
                    <div>
                      <h3 className="font-label-md text-on-surface font-semibold">Password</h3>
                      <p className="font-body-sm text-on-surface-variant text-[12px]">Update your account security password</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-md py-xs bg-surface-container-high border border-outline-variant rounded-lg font-label-sm text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer shrink-0"
                    >
                      Update Password
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-md border border-outline-variant/50 rounded-lg gap-sm bg-surface-container-low/30">
                    <div>
                      <h3 className="font-label-md text-on-surface font-semibold">Data Export</h3>
                      <p className="font-body-sm text-on-surface-variant text-[12px]">Download a JSON copy of your connections &amp; profile data</p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="px-md py-xs bg-primary-container text-on-primary-container border border-primary/30 rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors cursor-pointer shrink-0"
                    >
                      Export Data
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-md border border-error/30 bg-error-container/10 rounded-lg gap-sm mt-md">
                    <div>
                      <h3 className="font-label-md text-error font-semibold">Deactivate Account</h3>
                      <p className="font-body-sm text-on-surface-variant text-[12px]">Temporarily disable your profile on TRYBE</p>
                    </div>
                    <button
                      onClick={() => setShowDeactivateModal(true)}
                      className="px-md py-xs bg-error text-on-error rounded-lg font-label-sm hover:opacity-90 transition-colors cursor-pointer shrink-0"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl flex flex-col gap-lg w-full shadow-sm">
                <div className="border-b border-outline-variant/30 pb-sm">
                  <h2 className="font-headline-sm text-on-surface">Notification Preferences</h2>
                  <p className="font-body-sm text-on-surface-variant text-[13px] mt-xs">Control how and when TRYBE sends you alerts</p>
                </div>
                <div className="flex flex-col gap-md w-full">
                  <label className="flex items-center justify-between p-md border border-outline-variant/50 rounded-lg cursor-pointer bg-surface-container-low/30 hover:border-primary/40 transition-colors">
                    <div>
                      <h3 className="font-label-md text-on-surface font-semibold">Email Notifications</h3>
                      <p className="font-body-sm text-on-surface-variant text-[12px]">Receive updates about new connection requests &amp; events</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={e => setEmailNotifications(e.target.checked)}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-md border border-outline-variant/50 rounded-lg cursor-pointer bg-surface-container-low/30 hover:border-primary/40 transition-colors">
                    <div>
                      <h3 className="font-label-md text-on-surface font-semibold">In-App Push Alerts</h3>
                      <p className="font-body-sm text-on-surface-variant text-[12px]">Show toast notifications when your posts receive likes or comments</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={e => setPushNotifications(e.target.checked)}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl flex flex-col gap-lg w-full shadow-sm">
                <div className="border-b border-outline-variant/30 pb-sm">
                  <h2 className="font-headline-sm text-on-surface">Privacy &amp; Sharing</h2>
                  <p className="font-body-sm text-on-surface-variant text-[13px] mt-xs">Manage visibility settings and privacy rules</p>
                </div>
                <div className="flex flex-col gap-md w-full">
                  <label className="flex items-center justify-between p-md border border-outline-variant/50 rounded-lg cursor-pointer bg-surface-container-low/30 hover:border-primary/40 transition-colors">
                    <div>
                      <h3 className="font-label-md text-on-surface font-semibold">Public Profile</h3>
                      <p className="font-body-sm text-on-surface-variant text-[12px]">Allow students from other colleges to view your profile in Discover</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={publicProfile}
                      onChange={e => setPublicProfile(e.target.checked)}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                  </label>

                  <div className="pt-md border-t border-outline-variant/30 flex flex-col gap-xs">
                    <Link to="/privacy" className="text-primary font-label-md hover:underline flex items-center gap-xs">
                      Read Privacy Policy <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
                    </Link>
                    <Link to="/terms" className="text-primary font-label-md hover:underline flex items-center gap-xs">
                      Read Terms of Service <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl flex flex-col gap-lg w-full shadow-sm">
                <div className="border-b border-outline-variant/30 pb-sm">
                  <h2 className="font-headline-sm text-on-surface">Appearance &amp; Theme</h2>
                  <p className="font-body-sm text-on-surface-variant text-[13px] mt-xs">Customize application display styling and themes</p>
                </div>
                <div className="flex flex-col gap-md w-full">
                  <div className="p-md border border-outline-variant/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-sm bg-surface-container-low/30">
                    <div>
                      <h3 className="font-label-md text-on-surface font-semibold">Theme Mode</h3>
                      <p className="font-body-sm text-on-surface-variant text-[12px]">TRYBE uses a signature kinetic dark design system.</p>
                    </div>
                    <span className="px-md py-xs bg-primary-container/20 text-primary border border-primary-container rounded-full text-label-sm font-semibold self-start sm:self-auto shrink-0">
                      Dark Mode Active
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Update Password"
        subtitle="Ensure your account stays safe by using a strong password."
        size="sm"
        icon="key"
        iconVariant="primary"
        footer={
          <>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="px-lg py-sm rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePassword}
              className="px-lg py-sm rounded-lg bg-primary text-on-primary font-label-md hover:opacity-90 transition-opacity cursor-pointer"
            >
              Save Password
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-md w-full">
          <div className="w-full">
            <label className="block text-[13px] font-medium text-on-surface-variant mb-xs">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="w-full">
            <label className="block text-[13px] font-medium text-on-surface-variant mb-xs">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </Modal>

      {/* Deactivate Account Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate Account?"
        subtitle="You will be logged out and your profile will be hidden."
        size="sm"
        icon="warning"
        iconVariant="error"
        footer={
          <>
            <button
              onClick={() => setShowDeactivateModal(false)}
              className="px-lg py-sm rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowDeactivateModal(false);
                logout();
                navigate('/login');
              }}
              className="px-lg py-sm rounded-lg bg-error text-on-error font-label-md hover:opacity-90 transition-opacity cursor-pointer"
            >
              Confirm Deactivate
            </button>
          </>
        }
      >
        <p className="font-body-sm text-on-surface-variant leading-relaxed">
          Are you sure you want to deactivate your profile? You will be logged out immediately and your student profile won't be visible to others.
        </p>
      </Modal>
    </div>
  );
}

