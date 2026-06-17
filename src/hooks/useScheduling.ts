import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useScheduling() {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const getEventTypes = useQuery({
    queryKey: ["eventTypes"],
    queryFn: async () => {
      const res = await fetch(`/api/v1/scheduling/event-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch event types");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const getBookings = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await fetch(`/api/v1/scheduling/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const connectGoogle = useMutation({
    mutationFn: async (accessToken: string) => {
      const res = await fetch(`/api/v1/scheduling/calendar/connect/google`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken }),
      });
      if (!res.ok) throw new Error("Failed to connect Google Calendar");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendarAccounts"] }),
  });

  const createEventType = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      durationMin: number;
      slug: string;
    }) => {
      const res = await fetch(`/api/v1/scheduling/event-types`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event type");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eventTypes"] }),
  });

  const bookPublicly = useMutation({
    mutationFn: async ({ hostId, data }: { hostId: string; data: any }) => {
      const res = await fetch(`/api/v1/scheduling/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to book meeting");
      return res.json();
    },
  });

  return {
    eventTypes: getEventTypes.data || [],
    isLoadingEventTypes: getEventTypes.isLoading,
    bookings: getBookings.data || [],
    isLoadingBookings: getBookings.isLoading,
    connectGoogle: connectGoogle.mutateAsync,
    createEventType: createEventType.mutateAsync,
    bookPublicly: bookPublicly.mutateAsync,
  };
}
