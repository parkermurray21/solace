CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  advocate_id INTEGER NOT NULL REFERENCES advocates(id),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  appointment_time TIMESTAMP NOT NULL,
  notes TEXT,
  scheduling_status TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);