import db from "../../../db";
import { appointments } from "../../../db/schema";
import { gt, lt, and, eq, gte } from "drizzle-orm";

export interface AppointmentInput {
  advocateId: number;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  selectedAppointment: string;
  notes?: string;
}

enum AppointmentStatus {
  Requested = "requested",
  Pending = "pending",
  Approved = "approved",
  Confirmed = "confirmed",
}

export async function createAppointment(data: AppointmentInput) {
  const result = await db
    .insert(appointments)
    .values({
      advocateId: data.advocateId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      appointmentTime: new Date(data.selectedAppointment),
      notes: data.notes,
      schedulingStatus: AppointmentStatus.Requested,
    })
    .returning();

  return result;
}

export async function getAdvocateAvailability(
  advocateId: number
): Promise<Date[]> {
  const potentialSlots = getMockedAppointments();

  if (potentialSlots.length === 0) {
    return [];
  }

  const startDate = potentialSlots[0];
  const endDate = potentialSlots[potentialSlots.length - 1];

  const bookedAppointments = await db
    .select({
      id: appointments.id,
      advocateId: appointments.advocateId,
      appointmentTime: appointments.appointmentTime,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.advocateId, advocateId),
        gte(appointments.appointmentTime, startDate),
        lt(appointments.appointmentTime, endDate)
      )
    );

  // Create a set of booked times (using their timestamp values for easier comparison)
  const bookedTimes = new Set(
    bookedAppointments.map((app) => new Date(app.appointmentTime).getTime())
  );

  // Filter out any potential slot that is already booked.
  const availableSlots = potentialSlots.filter(
    (slot) => !bookedTimes.has(slot.getTime())
  );

  return availableSlots;
}

export function getMockedAppointments(): Date[] {
  const appointments: Date[] = [];
  let daysGenerated = 0;
  const now = new Date();

  let iterDate = new Date(now);

  while (daysGenerated < 5) {
    const dayOfWeek = iterDate.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      for (let i = 0; i < 15; i++) {
        const slot = new Date(iterDate);
        slot.setHours(9, 0, 0, 0);
        slot.setMinutes(slot.getMinutes() + i * 30);
        if (slot > now) {
          appointments.push(slot);
        }
      }
      daysGenerated++;
    }
    iterDate.setDate(iterDate.getDate() + 1);
  }

  return appointments;
}
