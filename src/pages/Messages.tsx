import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PEOPLE } from '../data/people';

type Message = {
    id: string;
    sender: 'me' | 'them';
    text: string;
    time: string;
};

type Conversation = {
    personId: string;
    lastMessage: string;
    time: string;
    unread: number;
};

const INITIAL_CONVERSATIONS: Conversation[] = [
    {
        personId: PEOPLE[0]?.id ?? 'sarah-chen',
        lastMessage: 'Hey! Saw your project. Looks really interesting.',
        time: '2m',
        unread: 2,
    },
    {
        personId: PEOPLE[1]?.id ?? 'priya-sharma',
        lastMessage: 'Would love to discuss the design system.',
        time: '18m',
        unread: 1,
    },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
    [PEOPLE[0]?.id ?? 'sarah-chen']: [
        {
            id: '1',
            sender: 'them',
            text: 'Hey! Saw your project. Looks really interesting.',
            time: '2:31 PM',
        },
        {
            id: '2',
            sender: 'me',
            text: 'Thanks! I am working on the next version right now.',
            time: '2:33 PM',
        },
    ],

    [PEOPLE[1]?.id ?? 'priya-sharma']: [
        {
            id: '3',
            sender: 'them',
            text: 'Would love to discuss the design system.',
            time: '1:48 PM',
        },
    ],
};

export default function Messages() {
    const { userProfile } = useApp();

    const people = PEOPLE.slice(0, 6);

    const [selectedId, setSelectedId] = useState(
        people[0]?.id ?? ''
    );

    const [search, setSearch] = useState('');
    const [messageText, setMessageText] = useState('');

    const [messages, setMessages] =
        useState<Record<string, Message[]>>(INITIAL_MESSAGES);

    const selectedPerson = people.find(
        (person) => person.id === selectedId
    );

    const conversations = useMemo(() => {
        return people.filter((person) => {
            const query = search.toLowerCase();

            return (
                person.name.toLowerCase().includes(query) ||
                person.role.toLowerCase().includes(query)
            );
        });
    }, [people, search]);

    const currentMessages = messages[selectedId] ?? [];

    const sendMessage = () => {
        const text = messageText.trim();

        if (!text || !selectedId) return;

        const newMessage: Message = {
            id: `${Date.now()}`,
            sender: 'me',
            text,
            time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        setMessages((prev) => ({
            ...prev,
            [selectedId]: [
                ...(prev[selectedId] ?? []),
                newMessage,
            ],
        }));

        setMessageText('');
    };

    return (
        <div className="flex-1 min-h-screen bg-background text-on-background">

            {/* Header */}
            <div className="border-b border-outline-variant bg-surface/70 backdrop-blur-xl">
                <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">

                    <div className="flex items-center gap-md">

                        <Link
                            to="/home"
                            className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
                        >
                            <span className="material-symbols-outlined">
                                arrow_back
                            </span>
                        </Link>

                        <div>
                            <h1 className="font-headline-lg text-on-surface">
                                Messages
                            </h1>

                            <p className="font-body-sm text-on-surface-variant">
                                Connect and chat with people from your campus.
                            </p>
                        </div>

                    </div>

                </div>
            </div>


            {/* Chat Area */}
            <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">

                <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-150px)] min-h-[520px] border border-outline-variant rounded-2xl overflow-hidden bg-surface">

                    {/* =================================================
              CONVERSATION LIST
          ================================================= */}
                    <aside className="border-r border-outline-variant flex flex-col">

                        <div className="p-md border-b border-outline-variant">

                            <div className="relative">

                                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                                    search
                                </span>

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search messages..."
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-md py-sm text-on-surface focus:outline-none focus:border-primary"
                                />

                            </div>

                        </div>


                        <div className="flex-1 overflow-y-auto">

                            {conversations.map((person) => {

                                const unread =
                                    INITIAL_CONVERSATIONS.find(
                                        (conversation) =>
                                            conversation.personId === person.id
                                    )?.unread ?? 0;

                                const isSelected =
                                    selectedId === person.id;

                                return (
                                    <button
                                        key={person.id}
                                        onClick={() => setSelectedId(person.id)}
                                        className={`w-full text-left p-md flex items-center gap-sm border-b border-outline-variant/50 transition-colors ${isSelected
                                                ? 'bg-primary-container/15'
                                                : 'hover:bg-surface-container-high/60'
                                            }`}
                                    >

                                        <div className="relative shrink-0">

                                            <img
                                                src={person.image}
                                                alt={person.name}
                                                className="w-12 h-12 rounded-full object-cover border border-outline-variant"
                                            />

                                            {person.online && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface" />
                                            )}

                                        </div>


                                        <div className="min-w-0 flex-1">

                                            <div className="flex items-center justify-between gap-sm">

                                                <h3 className="font-label-md text-on-surface truncate">
                                                    {person.name}
                                                </h3>

                                                {unread > 0 && (
                                                    <span className="min-w-5 h-5 px-1 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">
                                                        {unread}
                                                    </span>
                                                )}

                                            </div>

                                            <p className="text-[12px] text-on-surface-variant truncate mt-xs">
                                                {INITIAL_CONVERSATIONS.find(
                                                    (conversation) =>
                                                        conversation.personId === person.id
                                                )?.lastMessage ?? 'Start a conversation'}
                                            </p>

                                        </div>

                                    </button>
                                );
                            })}

                        </div>

                    </aside>


                    {/* =================================================
              CHAT
          ================================================= */}
                    <section className="hidden md:flex flex-col min-w-0">

                        {selectedPerson ? (
                            <>

                                {/* Chat Header */}
                                <div className="p-md border-b border-outline-variant flex items-center gap-md">

                                    <img
                                        src={selectedPerson.image}
                                        alt={selectedPerson.name}
                                        className="w-11 h-11 rounded-full object-cover border border-outline-variant"
                                    />

                                    <div className="flex-1">

                                        <h2 className="font-label-lg text-on-surface">
                                            {selectedPerson.name}
                                        </h2>

                                        <p className="text-xs text-on-surface-variant">
                                            {selectedPerson.online
                                                ? 'Online now'
                                                : selectedPerson.role}
                                        </p>

                                    </div>

                                    <Link
                                        to={`/profile`}
                                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high"
                                    >
                                        <span className="material-symbols-outlined">
                                            person
                                        </span>
                                    </Link>

                                </div>


                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-lg space-y-md">

                                    {currentMessages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">

                                            <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-md">

                                                <span className="material-symbols-outlined text-primary text-3xl">
                                                    chat
                                                </span>

                                            </div>

                                            <h3 className="font-headline-md text-on-surface">
                                                Start a conversation
                                            </h3>

                                            <p className="text-sm text-on-surface-variant mt-xs">
                                                Say hello to {selectedPerson.name}.
                                            </p>

                                        </div>
                                    ) : (
                                        currentMessages.map((message) => (

                                            <div
                                                key={message.id}
                                                className={`flex ${message.sender === 'me'
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                    }`}
                                            >

                                                <div
                                                    className={`max-w-[70%] rounded-2xl px-md py-sm ${message.sender === 'me'
                                                            ? 'bg-primary text-on-primary rounded-br-sm'
                                                            : 'bg-surface-container-high text-on-surface rounded-bl-sm'
                                                        }`}
                                                >

                                                    <p className="text-sm leading-relaxed">
                                                        {message.text}
                                                    </p>

                                                    <p
                                                        className={`text-[10px] mt-xs ${message.sender === 'me'
                                                                ? 'text-on-primary/70'
                                                                : 'text-on-surface-variant'
                                                            }`}
                                                    >
                                                        {message.time}
                                                    </p>

                                                </div>

                                            </div>

                                        ))
                                    )}

                                </div>


                                {/* Composer */}
                                <div className="p-md border-t border-outline-variant">

                                    <div className="flex items-center gap-sm bg-surface-container-low border border-outline-variant rounded-2xl p-xs">

                                        <input
                                            value={messageText}
                                            onChange={(e) =>
                                                setMessageText(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    sendMessage();
                                                }
                                            }}
                                            placeholder={`Message ${selectedPerson.name}...`}
                                            className="flex-1 bg-transparent px-md py-sm outline-none text-on-surface"
                                        />

                                        <button
                                            onClick={sendMessage}
                                            disabled={!messageText.trim()}
                                            className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined">
                                                send
                                            </span>
                                        </button>

                                    </div>

                                </div>

                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-on-surface-variant">
                                Select a conversation
                            </div>
                        )}

                    </section>

                </div>

            </div>

        </div>
    );
}