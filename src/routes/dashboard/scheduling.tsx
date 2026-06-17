import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";

import { useScheduling } from "../../hooks/useScheduling";
import { Calendar, Clock, Video, Plus, Link as LinkIcon, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/dashboard/scheduling")({
  component: SchedulingPage,
});

function SchedulingPage() {
  const { eventTypes, bookings, connectGoogle, createEventType } = useScheduling();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationMin: 30,
    slug: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEventType(formData);
    setIsCreating(false);
    setFormData({ title: "", description: "", durationMin: 30, slug: "" });
  };

  const handleConnectGoogle = async () => {
    // Simulated Google OAuth Flow returning a token
    await connectGoogle("mock_google_oauth_token_123");
    toast.success("Google Calendar successfully synced!");
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col rounded-xl overflow-hidden">
      <main className="flex-1 w-full mx-auto p-6 overflow-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Scheduling Platform
            </h1>
            <p className="text-slate-500">
              Manage your event types, availability, and upcoming bookings.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleConnectGoogle}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-4 h-4 text-blue-500" />
              Sync Google Calendar
            </button>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              New Event Type
            </button>
          </div>
        </div>

        {isCreating && (
          <form
            onSubmit={handleCreate}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-2xl"
          >
            <h3 className="font-bold text-lg mb-4">Create Event Type</h3>
            <div className="grid gap-4 mb-4">
              <input
                type="text"
                placeholder="Title (e.g. 30 Min Discovery)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="p-3 border rounded-lg w-full"
                required
              />
              <input
                type="text"
                placeholder="Slug (e.g. discovery-call)"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="p-3 border rounded-lg w-full"
                required
              />
              <input
                type="number"
                placeholder="Duration (mins)"
                value={formData.durationMin}
                onChange={(e) => setFormData({ ...formData, durationMin: Number(e.target.value) })}
                className="p-3 border rounded-lg w-full"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                Save Event
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Event Types Section */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-indigo-500" /> Event Types
            </h2>
            <div className="space-y-4">
              {eventTypes.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 border-dashed rounded-2xl text-slate-500">
                  No event types created yet.
                </div>
              ) : (
                eventTypes.map((type: any) => (
                  <div
                    key={type.id}
                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex justify-between items-center group hover:border-indigo-300 transition"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800">{type.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> {type.durationMin} mins
                      </p>
                    </div>
                    <button className="text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                      Copy Link
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Bookings Section */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" /> Upcoming Bookings
            </h2>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 border-dashed rounded-2xl text-slate-500">
                  No upcoming meetings.
                </div>
              ) : (
                bookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-300 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate-800">{booking.guestName}</h3>
                        <p className="text-sm text-slate-500">
                          {new Date(booking.startTime).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                        {booking.status}
                      </span>
                    </div>
                    {booking.meetingUrl && (
                      <a
                        href={booking.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50/50 px-3 py-1.5 rounded-lg transition"
                      >
                        <Video className="w-4 h-4" /> Join LiveKit Room
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
