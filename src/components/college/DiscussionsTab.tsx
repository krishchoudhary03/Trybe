import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

type Channel = 'general' | 'announcements' | 'events-chat' | 'club-help';

const CHANNEL_SEED: Record<Channel, Message[]> = {
  general: [
    {
      id: 'g1',
      author: 'Priya Sharma',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzSrOPjCm9XqfTTHYXSZpe3BbQs-Jm3dHw_yMaDagkljza4jaOWYta1XqeXWCYMn49nCsLRt_ImjXFAJCSOHd9-j86P01mGNfASwaYKBRItPlBgr3PDBIZZmC62RlE17MrNhDjBzvkrEfDba8cee9INw9Py_3p_gsOpi_boQEr_w2ZVOsQEH_2tRc4tpUU-zaaeUwHwlZMoWXg8zvEWf2slbdt49Q6C3gUdC4Ll8QWjdWKHQlb3jqx',
      text: 'Has anyone seen the updated schedule for the hackathon?',
      time: '12:45 PM',
    },
    {
      id: 'g2',
      author: 'Alex Chen',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDj2WzotkchTwupi_MCB6qr4JdN-aHLS2ca2gz3dSpF4XitBoOr2miSPEGNyG-bjDJ5xfubzDDpj4oxVyZW_Wh6WsHQA4tNg04QwuSvmsdTCDVUPwsSvxJ_faCInQx4UGqW3bGpGhyKuG4joozaa8zZi2jjxSNxKrZmy_meX-Moj84j0Su1URPT8EPdtskUNX613mPB2yNWHvjF3084l_sh8qSa0ahMy54OiTvl4s_BXofXPBPEqdR0',
      text: "It's pinned in the #announcements channel!",
      time: '12:48 PM',
    },
  ],
  announcements: [
    {
      id: 'a1',
      author: 'GLA Administration',
      avatar: '',
      text: '📢 Mid-semester exams start October 15th. Library hours extended until midnight. Check the portal for your seating.',
      time: '9:00 AM',
    },
    {
      id: 'a2',
      author: 'Student Council',
      avatar: '',
      text: '🏆 Hackathon registrations are now open! Form your team and register at the main office by Friday.',
      time: '11:30 AM',
    },
  ],
  'events-chat': [
    {
      id: 'e1',
      author: 'Rohan Sharma',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb3houXNWLXON9IYsFB6QtYiXNkHjkCtZgQjOfjW8uLVF4Niwp4i7FQSGDFqiwQDy1SkJ6wnl_KaZQeyVIYEIgWzgtdCIO3KRubQofQHdYTiH9bmT1DUkBT1ZSo7i9Wt3hi1_eZgwdtWaDjLD9B5pcZR6pyNtfXLSZ4AWjzxIQr0jnA_oT-e2o7-7jCcd7Zw5dPOTeCYIsbxld6cDb_0KCm5j74eLxB3nZU9DCBmesWH40C4rYiT0O',
      text: "Who's going to the AI Showcase tonight? 🤖",
      time: '2:10 PM',
    },
  ],
  'club-help': [
    {
      id: 'ch1',
      author: 'Nisha Gupta',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUXnEH6lKCl6QUFpBOnBCol61TGevdyhB3nbEyqlVaTugoGuGMl303b0fVqFJjhFfu63S_go__AvgbdT-it_fE-1hAV6bz1rrpLB4XbSx4WM9HoFTPDfVm21YfLOFdHN4y9pCRTgbpjaLzL37L0T4ZqalyT2HVDOGxH6LlhGG3KJ6Z8TY-jHonoYZRYiOfmqIASAvp_7nh_vauzHupg6jruXquZTVbYZWfSYINwK_pw1uFDfJnXYBd',
      text: 'How do I create a club event? I want to post something for our photography meetup.',
      time: '3:05 PM',
    },
    {
      id: 'ch2',
      author: 'Priya Sharma',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzSrOPjCm9XqfTTHYXSZpe3BbQs-Jm3dHw_yMaDagkljza4jaOWYta1XqeXWCYMn49nCsLRt_ImjXFAJCSOHd9-j86P01mGNfASwaYKBRItPlBgr3PDBIZZmC62RlE17MrNhDjBzvkrEfDba8cee9INw9Py_3p_gsOpi_boQEr_w2ZVOsQEH_2tRc4tpUU-zaaeUwHwlZMoWXg8zvEWf2slbdt49Q6C3gUdC4Ll8QWjdWKHQlb3jqx',
      text: 'Go to your Club Dashboard → Events tab and post from there. Club admins can create events directly.',
      time: '3:12 PM',
    },
  ],
};

const CURRENT_USER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuALGkZg4umnZu-tLOdOYdz0Vnj_OQIO0WmriQJX0_RE30b2Y4w--HOkOne1Y1BmYb3ihB2ex_VUfC0uiboeT3w4POkPSKt3FRyzPQmvGv7ZDPohfY6-KmdOv01SmAeZTvw2vowFicPX7KG_RnaFOhlQEOdu8ArQUo7SUNZGSiX0CsDimvZRnhOkEyJUSZl2Ol5TjPXtrAqbB7Ja_InLmdqZ9j8D3OonDOzHTNLO-8Y5pAdykQ0WGs2z';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function DiscussionsTab() {
  const { userProfile, showToast } = useApp();
  const [activeChannel, setActiveChannel] = useState<Channel>('general');
  const [channelMessages, setChannelMessages] = useState<Record<Channel, Message[]>>(() => {
    try {
      const stored = localStorage.getItem('trybee_discussions_messages');
      return stored ? JSON.parse(stored) : CHANNEL_SEED;
    } catch {
      return CHANNEL_SEED;
    }
  });
  const [input, setInput] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('trybee_discussions_messages', JSON.stringify(channelMessages));
    } catch {}
  }, [channelMessages]);

  const CHANNELS: { id: Channel; label: string; description: string }[] = [
    { id: 'general', label: 'general', description: 'General campus chat' },
    { id: 'announcements', label: 'announcements', description: 'Official college announcements' },
    { id: 'events-chat', label: 'events-chat', description: 'Talk about upcoming events' },
    { id: 'club-help', label: 'club-help', description: 'Get help with clubs' },
  ];

  const messages = channelMessages[activeChannel] ?? [];

  // Scroll to bottom when messages change or channel switches
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      author: userProfile.name,
      avatar: userProfile.avatar,
      text,
      time: formatTime(new Date()),
    };

    setChannelMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] ?? []), newMsg],
    }));
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const switchChannel = (ch: Channel) => {
    setActiveChannel(ch);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden border border-outline-variant rounded-xl h-[calc(100vh-320px)] min-h-[500px] relative">
      {/* Mobile channel toggle */}
      <button
        onClick={() => setMobileSidebarOpen(o => !o)}
        className="md:hidden absolute top-3 left-3 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-high border border-outline-variant text-on-surface-variant"
      >
        <span className="material-symbols-outlined text-[18px]">menu</span>
      </button>

      {/* Channel Sidebar */}
      <aside
        className={`${
          mobileSidebarOpen ? 'flex' : 'hidden'
        } md:flex w-56 bg-surface-container-low border-r border-outline-variant flex-col absolute md:relative z-10 h-full md:h-auto`}
      >
        <div className="p-md border-b border-outline-variant flex items-center justify-between">
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Channels</h3>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden w-6 h-6 flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-sm flex flex-col gap-xs">
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => switchChannel(ch.id)}
              className={`flex items-center gap-sm px-sm py-xs rounded-lg font-label-md transition-colors w-full text-left group ${
                activeChannel === ch.id
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
              title={ch.description}
            >
              <span className={`opacity-60 ${activeChannel === ch.id ? 'opacity-100' : ''}`}>#</span>
              {ch.label}
              {activeChannel === ch.id && (
                <span className="ml-auto w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </button>
          ))}
        </div>

        <div className="p-sm border-t border-outline-variant">
          <div className="flex items-center gap-sm px-sm py-xs rounded-lg bg-surface-container border border-outline-variant">
            <img
              src={CURRENT_USER_AVATAR}
              alt="You"
              className="w-6 h-6 rounded-full object-cover border border-outline-variant shrink-0"
            />
            <span className="font-label-sm text-on-surface truncate text-[11px]">{userProfile.name}</span>
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-surface min-w-0">
        {/* Channel header */}
        <div className="px-lg py-sm border-b border-outline-variant flex items-center gap-sm shrink-0">
          <span className="text-on-surface-variant font-body-md">#</span>
          <span className="font-label-md text-on-surface">{activeChannel}</span>
          <span className="text-on-surface-variant font-body-sm hidden sm:inline">
            — {CHANNELS.find(c => c.id === activeChannel)?.description}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-md flex flex-col gap-md">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center text-on-surface-variant py-16">
              <div>
                <span className="material-symbols-outlined text-4xl mb-4 block">forum</span>
                <p className="font-body-md">No messages yet in #{activeChannel}</p>
                <p className="font-body-sm mt-xs">Be the first to say something!</p>
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="flex gap-md group">
                {msg.avatar ? (
                  <img
                    alt={msg.author}
                    className="w-9 h-9 rounded-full object-cover border border-outline-variant shrink-0 mt-xs"
                    src={msg.avatar}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0 mt-xs">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">campaign</span>
                  </div>
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-baseline gap-sm">
                    <span className="font-label-md text-on-surface">{msg.author}</span>
                    <span className="text-label-sm text-on-surface-variant text-[11px]">{msg.time}</span>
                  </div>
                  <p className="text-body-md text-on-surface-variant mt-xs break-words">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-md border-t border-outline-variant shrink-0">
          <div className="bg-surface-container-high rounded-xl border border-outline-variant flex items-center gap-sm px-sm py-xs">
            <button
              onClick={() => showToast('Image & file attachment features are coming soon.', 'info')}
              className="p-xs text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Add attachment"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add_circle</span>
            </button>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant font-body-md outline-none px-sm py-xs"
              placeholder={`Message #${activeChannel}`}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center gap-xs">
              <button
                onClick={() => setInput(prev => prev + ' 😊')}
                className="p-xs text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Insert emoji"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">mood</span>
              </button>
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-xs text-primary hover:text-primary-fixed transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
