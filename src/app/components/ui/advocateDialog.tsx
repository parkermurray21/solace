"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import ScheduleDialog from "./scheduleDialog";
import { Advocate } from "@/db/schema";

interface AdvocateDialogProps {
  advocate: Advocate | null;
  onClose: () => void;
}

export default function AdvocateDialog({
  advocate,
  onClose,
}: AdvocateDialogProps) {
  // Local state to control opening the scheduling dialog.
  const [openSchedule, setOpenSchedule] = useState(false);

  const handleScheduleNow = () => {
    setOpenSchedule(true);
  };

  const handleCloseSchedule = () => {
    setOpenSchedule(false);
  };

  return (
    <>
      <Dialog open={Boolean(advocate)} onClose={onClose}>
        <DialogTitle>
          {advocate ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Avatar>
                {advocate.firstName.charAt(0)}
                {advocate.lastName.charAt(0)}
              </Avatar>
              <span>
                {advocate.firstName} {advocate.lastName}
              </span>
            </div>
          ) : (
            "Provider Details"
          )}
        </DialogTitle>
        <DialogContent dividers>
          {advocate && (
            <div className="space-y-2">
              <p>
                <strong>City:</strong> {advocate.city}
              </p>
              <p>
                <strong>Degree:</strong> {advocate.degree}
              </p>
              <p>
                <strong>Experience:</strong> {advocate.yearsOfExperience} years
              </p>
              <p>
                <strong>Phone:</strong> {advocate.phoneNumber}
              </p>
              <div>
                <strong>Specialties:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {advocate.specialties.map((spec, idx) => (
                    <Chip key={idx} label={spec} size="small" />
                  ))}
                </div>
              </div>
              {/* Embedded Google Maps box */}
              <div className="mt-4">
                <strong>Location:</strong>
                <div className="mt-1">
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=${
                      process.env.GOOGLE_API_KEY
                    }&q=${encodeURIComponent(advocate.city)}`}
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          {advocate && (
            <Button onClick={handleScheduleNow} variant="contained">
              Schedule Now
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* Render the scheduling dialog. It will open on top of the AdvocateDialog */}
      {advocate && (
        <ScheduleDialog
          advocateId={advocate.id}
          open={openSchedule}
          onClose={handleCloseSchedule}
        />
      )}
    </>
  );
}
