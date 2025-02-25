"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

export interface AppointmentData {
  advocateId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  selectedAppointment: string;
  notes: string;
}

interface AppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  advocateId: number;
}

const postAppointmentRequest = async (data: AppointmentData): Promise<any> => {
  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to post appointment request");
  }
  return response.json();
};

export function useCustomMutation<T, V = void, E = Error>(
  mutationFn: (variables: V) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (variables: V) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, error, isLoading, mutate };
}

function formatAppointment(appointment: Date): string {
  // Format date part (e.g., "Mon Feb 24 2025")
  const datePart = appointment.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Format time part in 12-hour format with am/pm
  let hours = appointment.getHours();
  const minutes = appointment.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minuteStr = minutes.toString().padStart(2, "0");

  return `${datePart} ${hours}:${minuteStr}${ampm}`;
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  open,
  onClose,
  advocateId,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [notes, setNotes] = useState("");

  // State for fetched availability slots.
  const [availability, setAvailability] = useState<Date[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState<boolean>(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );

  // Fetch availability when the dialog opens or advocateId changes.
  useEffect(() => {
    async function fetchAvailability() {
      setAvailabilityLoading(true);
      setAvailabilityError(null);
      try {
        const res = await fetch(`/api/availability?advocateId=${advocateId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          setAvailabilityError(json.error || "Failed to fetch availability");
          setAvailability([]);
        } else {
          // Assuming the API returns an array of ISO date strings.
          const slots: Date[] = json.availability.map(
            (slot: string) => new Date(slot)
          );
          setAvailability(slots);
        }
      } catch (err: any) {
        setAvailabilityError(err.message);
      } finally {
        setAvailabilityLoading(false);
      }
    }
    if (open) {
      fetchAvailability();
    }
  }, [open, advocateId]);

  const { mutate, isLoading, error } = useCustomMutation<any, AppointmentData>(
    postAppointmentRequest
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutate({
        advocateId,
        firstName,
        lastName,
        phone,
        email,
        selectedAppointment,
        notes,
      });
      // Reset fields and close dialog on success.
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setSelectedAppointment("");
      setNotes("");
      onClose();
    } catch (err) {
      console.error("Error posting appointment request:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Schedule Appointment</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} id="appointment-form">
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="appointment-label">
              Available Appointments
            </InputLabel>
            <Select
              labelId="appointment-label"
              value={selectedAppointment}
              label="Available Appointments"
              onChange={(e) => setSelectedAppointment(e.target.value as string)}
              disabled={availabilityLoading || !!availabilityError}
            >
              {availabilityLoading && (
                <MenuItem value="">
                  <em>Loading...</em>
                </MenuItem>
              )}
              {availabilityError && (
                <MenuItem value="">
                  <em>Error loading availability</em>
                </MenuItem>
              )}
              {!availabilityLoading &&
                !availabilityError &&
                availability.map((appointment, index) => (
                  <MenuItem key={index} value={appointment.toString()}>
                    {formatAppointment(appointment)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          {error && (
            <p style={{ color: "red", marginTop: "8px" }}>
              Error: {error.message}
            </p>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          form="appointment-form"
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDialog;
