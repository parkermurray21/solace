import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";

const advocates = pgTable("advocates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  degree: text("degree").notNull(),
  specialties: jsonb("payload").default([]).notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  advocateId: integer("advocate_id")
    .notNull()
    .references(() => advocates.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  email: text("email").notNull(),
  appointmentTime: timestamp("appointment_time").notNull(),
  notes: text("notes"),
  schedulingStatus: text("scheduling_status"),
  createdAt: timestamp("created_at").defaultNow(),
});

export { advocates };
export type Advocate = Omit<typeof advocates.$inferSelect, "specialties"> & {
  specialties: string[];
};
export type AdvocatePaginatedData = {
  results: Advocate[];
  page: string;
  totalCount: number;
  totalPages: number;
};
