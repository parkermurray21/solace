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
import { useAppointmentAvailability } from "../../hooks/useAppointmentAvailability";
import { usePostAppointment } from "../../hooks/usePostAppointment";

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

function formatAppointment(appointment: Date): string {
  const datePart = appointment.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

  const {
    availability,
    isLoading: availabilityLoading,
    error: availabilityError,
  } = useAppointmentAvailability(advocateId, open);

  const { mutate, isLoading, error } = usePostAppointment();

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
