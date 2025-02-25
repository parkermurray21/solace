import { useCustomMutation } from "./useCustomMutation";

export type AppointmentData = {
  advocateId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  selectedAppointment: string;
  notes: string;
};

async function postAppointmentRequest(data: AppointmentData): Promise<any> {
  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to post appointment request");
  }
  return response.json();
}

export function usePostAppointment() {
  return useCustomMutation<any, AppointmentData>(postAppointmentRequest);
}
