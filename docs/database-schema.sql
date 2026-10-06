-- Medicare Hospital Management Platform — PostgreSQL schema
-- This is the production target schema. The app currently ships with a
-- JSON-file data layer (lib/db/store.ts) for zero-dependency local/demo use.
-- Swapping to Postgres means: run this DDL, then reimplement lib/db/store.ts's
-- read/mutate functions against a Postgres client (pg, drizzle, or Prisma) —
-- no route or component code needs to change, since every route only calls
-- readDb()/mutateDb().

CREATE TYPE role AS ENUM ('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE appointment_type AS ENUM ('ONLINE', 'WALK_IN', 'FOLLOW_UP', 'EMERGENCY');
CREATE TYPE appointment_status AS ENUM (
  'REQUESTED', 'CONFIRMED', 'CHECKED_IN', 'IN_CONSULTATION',
  'COMPLETED', 'CANCELLED', 'NO_SHOW'
);
CREATE TYPE doctor_day AS ENUM ('SUN','MON','TUE','WED','THU','FRI','SAT');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role          role NOT NULL,
  email         CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  gender        gender,
  date_of_birth DATE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE patient_profiles (
  user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  patient_code            TEXT UNIQUE NOT NULL,
  address                 TEXT,
  blood_group             TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  allergies               TEXT,
  chronic_conditions      TEXT,
  insurance_provider      TEXT,
  insurance_policy_no     TEXT
);

CREATE TABLE doctor_profiles (
  user_id            UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  department_id      UUID NOT NULL REFERENCES departments(id),
  specialization     TEXT NOT NULL,
  qualification      TEXT NOT NULL,
  registration_no    TEXT NOT NULL,
  consultation_fee   NUMERIC(10,2) NOT NULL DEFAULT 0,
  years_experience   INTEGER NOT NULL DEFAULT 0,
  bio                TEXT
);
CREATE INDEX idx_doctor_profiles_dept ON doctor_profiles(department_id);

CREATE TABLE doctor_availability (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id    UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
  day          doctor_day NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  slot_minutes INTEGER NOT NULL DEFAULT 15
);
CREATE INDEX idx_doctor_availability_doctor ON doctor_availability(doctor_id);

CREATE TABLE doctor_leave (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id  UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
  leave_date DATE NOT NULL,
  UNIQUE (doctor_id, leave_date)
);

CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number     INTEGER NOT NULL,
  patient_id       UUID NOT NULL REFERENCES users(id),
  doctor_id        UUID NOT NULL REFERENCES users(id),
  department_id    UUID NOT NULL REFERENCES departments(id),
  date             DATE NOT NULL,
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  type             appointment_type NOT NULL DEFAULT 'ONLINE',
  status           appointment_status NOT NULL DEFAULT 'REQUESTED',
  reason_for_visit TEXT NOT NULL,
  created_by       UUID NOT NULL REFERENCES users(id),
  cancel_reason    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevents double-booking the same doctor's slot with an active appointment.
  CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, date, start_time)
);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, date);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE TABLE consultation_notes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id      UUID NOT NULL REFERENCES users(id),
  patient_id     UUID NOT NULL REFERENCES users(id),
  diagnosis      TEXT NOT NULL,
  notes          TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notes_patient ON consultation_notes(patient_id);

CREATE TABLE prescriptions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id      UUID NOT NULL REFERENCES users(id),
  patient_id     UUID NOT NULL REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);

CREATE TABLE prescription_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine        TEXT NOT NULL,
  dosage          TEXT NOT NULL,
  frequency       TEXT NOT NULL,
  duration_days   INTEGER NOT NULL,
  instructions    TEXT
);

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  detail      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Future modules (not yet implemented in the app — see README roadmap):
-- lab_orders, lab_results, pharmacy_inventory, pharmacy_sales,
-- invoices, invoice_line_items, payments, insurance_claims, beds,
-- emergency_visits, staff_leave, notification_log.
