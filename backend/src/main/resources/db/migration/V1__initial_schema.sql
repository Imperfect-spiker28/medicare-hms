-- V1__initial_schema.sql
-- Medicare Hospital Management Platform - PostgreSQL Migration

CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY,
    role          VARCHAR(30) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    phone         VARCHAR(50) NOT NULL,
    gender        VARCHAR(20),
    date_of_birth DATE,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS departments (
    id          UUID PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS patient_profiles (
    user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    patient_code            VARCHAR(50) NOT NULL UNIQUE,
    address                 TEXT,
    blood_group             VARCHAR(20),
    emergency_contact_name  VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    allergies               TEXT,
    chronic_conditions      TEXT,
    insurance_provider      VARCHAR(255),
    insurance_policy_no     VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS doctor_profiles (
    user_id            UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    department_id      UUID NOT NULL REFERENCES departments(id),
    specialization     VARCHAR(255) NOT NULL,
    qualification      VARCHAR(255) NOT NULL,
    registration_no    VARCHAR(100) NOT NULL,
    consultation_fee   NUMERIC(10,2) NOT NULL DEFAULT 0,
    years_experience   INTEGER NOT NULL DEFAULT 0,
    bio                TEXT
);

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_dept ON doctor_profiles(department_id);

CREATE TABLE IF NOT EXISTS doctor_availability (
    id           UUID PRIMARY KEY,
    doctor_id    UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
    day          VARCHAR(10) NOT NULL,
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    slot_minutes INTEGER NOT NULL DEFAULT 15
);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_doc ON doctor_availability(doctor_id);

CREATE TABLE IF NOT EXISTS doctor_leave (
    id         UUID PRIMARY KEY,
    doctor_id  UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
    leave_date DATE NOT NULL,
    CONSTRAINT uq_doctor_leave UNIQUE (doctor_id, leave_date)
);

CREATE TABLE IF NOT EXISTS appointments (
    id               UUID PRIMARY KEY,
    token_number     INTEGER NOT NULL,
    patient_id       UUID NOT NULL REFERENCES users(id),
    doctor_id        UUID NOT NULL REFERENCES users(id),
    department_id    UUID NOT NULL REFERENCES departments(id),
    date             DATE NOT NULL,
    start_time       TIME NOT NULL,
    end_time         TIME NOT NULL,
    type             VARCHAR(30) NOT NULL DEFAULT 'ONLINE',
    status           VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    reason_for_visit TEXT NOT NULL,
    created_by       UUID NOT NULL REFERENCES users(id),
    cancel_reason    TEXT,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE TABLE IF NOT EXISTS consultation_notes (
    id             UUID PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id      UUID NOT NULL REFERENCES users(id),
    patient_id     UUID NOT NULL REFERENCES users(id),
    diagnosis      TEXT NOT NULL,
    notes          TEXT NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_patient ON consultation_notes(patient_id);

CREATE TABLE IF NOT EXISTS prescriptions (
    id             UUID PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id      UUID NOT NULL REFERENCES users(id),
    patient_id     UUID NOT NULL REFERENCES users(id),
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);

CREATE TABLE IF NOT EXISTS prescription_items (
    id              UUID PRIMARY KEY,
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine        VARCHAR(255) NOT NULL,
    dosage          VARCHAR(100) NOT NULL,
    frequency       VARCHAR(100) NOT NULL,
    duration_days   INTEGER NOT NULL,
    instructions    TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY,
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id   UUID,
    detail      TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
