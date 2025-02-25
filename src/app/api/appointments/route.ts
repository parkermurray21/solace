import { z } from "zod";
import { createAppointment } from "../services/appointmentsService";
import { advocateData } from "@/db/seed/advocates";

const AppointmentSchema = z.object({
  advocateId: z.number(),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }),
  // selectedAppointment is expected to be a string that can be parsed into a Date.
  selectedAppointment: z
    .string()
    .min(1, { message: "Appointment time is required" }),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received appointment data:", body);

    const validationResult = AppointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { success: false, errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const appointmentData = validationResult.data;
    // Call our service to create the appointment.
    const newAppointment = await createAppointment(appointmentData);

    return Response.json({ success: true, appointment: newAppointment });
  } catch (error: any) {
    console.error("Error processing appointment request:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
