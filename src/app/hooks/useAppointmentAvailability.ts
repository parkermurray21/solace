import { useState, useEffect } from "react";

export function useAppointmentAvailability(
  advocateId: number,
  open: boolean
): {
  availability: Date[];
  isLoading: boolean;
  error: string | null;
} {
  const [availability, setAvailability] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailability() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/availability?advocateId=${advocateId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || "Failed to fetch availability");
          setAvailability([]);
        } else {
          // Assuming the API returns an array of ISO date strings.
          const slots: Date[] = json.availability.map(
            (slot: string) => new Date(slot)
          );
          setAvailability(slots);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (open) {
      fetchAvailability();
    }
  }, [open, advocateId]);

  return { availability, isLoading, error };
}
