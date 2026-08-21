import { useApp } from '../../context/AppContext';
import { getEventsByCollege } from '../../data/events';

const COLLEGE_ID = 'gla-university';

export function EventsTab() {
  const { rsvpdEvents, interestedEvents, rsvpEvent, cancelRsvp, markInterested, removeInterested } = useApp();
  const events = getEventsByCollege(COLLEGE_ID);

  const featured = events.find(e => e.isFeatured);
  const rest = events.filter(e => !e.isFeatured);

  return (
    <div className="flex-1 flex flex-col gap-lg max-w-[700px]">
      <div className="flex flex-col gap-lg">
        {/* Featured Event */}
        {featured && (
          <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden flex flex-col">
            <div className="h-48 bg-surface-container-high relative">
              {featured.image && (
                <img
                  alt={featured.title}
                  className="w-full h-full object-cover opacity-60"
                  src={featured.image}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
              <div className="absolute bottom-md left-md">
                <span className="px-sm py-base bg-primary text-on-primary rounded-full font-label-sm text-label-sm">
                  Featured Event
                </span>
              </div>
            </div>
            <div className="p-md flex flex-col gap-md">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-xs">
                  <h2 className="font-headline-md text-headline-md text-on-surface">{featured.title}</h2>
                  <div className="flex items-center gap-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-body-sm">calendar_today</span>
                    <span className="font-body-sm text-body-sm">
                      {featured.date}, {featured.time}
                    </span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant">{featured.location}</p>
                </div>
                <button
                  onClick={() =>
                    rsvpdEvents.has(featured.id) ? cancelRsvp(featured.id) : rsvpEvent(featured.id)
                  }
                  className={`px-lg py-sm rounded-lg font-label-md text-label-md transition-colors shrink-0 ${
                    rsvpdEvents.has(featured.id)
                      ? 'bg-surface-container-high border border-outline-variant text-on-surface'
                      : 'bg-primary text-on-primary hover:bg-primary-fixed'
                  }`}
                >
                  {rsvpdEvents.has(featured.id) ? "RSVP'd ✓" : 'RSVP Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {rest.length > 0 && (
          <div>
            <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-md">
              Upcoming Events
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {rest.map(event => (
                <div
                  key={event.id}
                  className="bg-surface rounded-xl border border-outline-variant p-md flex flex-col gap-md"
                >
                  {event.image && (
                    <div className="h-32 bg-surface-container-low rounded-lg overflow-hidden">
                      <img
                        alt={event.title}
                        className="w-full h-full object-cover"
                        src={event.image}
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-xs flex-1">
                    <h3 className="font-label-md text-label-md text-on-surface">{event.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {event.date}, {event.time} • {event.location}
                    </p>
                  </div>
                  <div className="flex gap-sm">
                    <button
                      onClick={() =>
                        rsvpdEvents.has(event.id) ? cancelRsvp(event.id) : rsvpEvent(event.id)
                      }
                      className={`flex-1 py-base border rounded-lg font-label-sm text-label-sm transition-colors ${
                        rsvpdEvents.has(event.id)
                          ? 'bg-primary text-on-primary border-primary'
                          : 'border-outline-variant text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {rsvpdEvents.has(event.id) ? "RSVP'd ✓" : 'RSVP'}
                    </button>
                    <button
                      onClick={() =>
                        interestedEvents.has(event.id)
                          ? removeInterested(event.id)
                          : markInterested(event.id)
                      }
                      className={`flex-1 py-base border rounded-lg font-label-sm text-label-sm transition-colors ${
                        interestedEvents.has(event.id)
                          ? 'bg-primary-container text-on-primary-container border-primary-container'
                          : 'border-outline-variant text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {interestedEvents.has(event.id) ? 'Interested ✓' : 'Interested'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-4 block">event_busy</span>
            <p className="font-body-md">No upcoming events right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
