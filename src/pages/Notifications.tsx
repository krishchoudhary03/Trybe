import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Notifications() {
    const {
        notifications,
    } = useApp();

    const unread = notifications.filter(
        (notification) => !notification.read
    );

    return (
        <div className="flex-1 min-h-screen bg-background">

            <div className="max-w-[900px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">

                {/* Header */}
                <div className="flex items-center gap-md mb-xl">

                    <Link
                        to="/home"
                        className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high"
                    >
                        <span className="material-symbols-outlined">
                            arrow_back
                        </span>
                    </Link>

                    <div>
                        <h1 className="font-headline-lg text-on-surface">
                            Notifications
                        </h1>

                        <p className="text-sm text-on-surface-variant">
                            Stay updated with what is happening around you.
                        </p>
                    </div>

                </div>


                {/* Unread count */}
                {unread.length > 0 && (
                    <div className="mb-md px-md py-sm rounded-xl border border-primary/30 bg-primary-container/10 text-sm text-on-surface">
                        <span className="font-semibold text-primary">
                            {unread.length}
                        </span>{' '}
                        unread notification{unread.length > 1 ? 's' : ''}
                    </div>
                )}


                {/* Notifications */}
                <div className="border border-outline-variant rounded-2xl overflow-hidden bg-surface">

                    {notifications.length === 0 ? (
                        <div className="py-20 text-center">

                            <span className="material-symbols-outlined text-5xl text-on-surface-variant">
                                notifications_none
                            </span>

                            <h2 className="font-headline-md text-on-surface mt-md">
                                You're all caught up
                            </h2>

                            <p className="text-sm text-on-surface-variant mt-xs">
                                New activity will appear here.
                            </p>

                        </div>
                    ) : (
                        notifications.map((notification) => (

                            <div
                                key={notification.id}
                                className={`p-md flex gap-md border-b border-outline-variant last:border-b-0 ${!notification.read
                                        ? 'bg-primary-container/10'
                                        : ''
                                    }`}
                            >

                                {/* Icon */}
                                <div className="w-11 h-11 rounded-full bg-primary-container/20 text-primary flex items-center justify-center shrink-0">

                                    <span className="material-symbols-outlined">
                                        notifications
                                    </span>

                                </div>


                                {/* Content */}
                                <div className="flex-1 min-w-0">

                                    <div className="flex justify-between gap-md">

                                        <h3 className="font-label-md text-on-surface">
                                            {notification.title}
                                        </h3>

                                        {!notification.read && (
                                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                                        )}

                                    </div>

                                    <p className="text-sm text-on-surface-variant mt-xs">
                                        {notification.message}
                                    </p>

                                    <p className="text-[11px] text-on-surface-variant mt-sm">
                                        {notification.timestamp}
                                    </p>

                                </div>

                            </div>

                        ))
                    )}

                </div>

            </div>

        </div>
    );
}