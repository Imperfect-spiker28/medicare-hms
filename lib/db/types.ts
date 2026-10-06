// Core domain types for Medicare Hospital Management System
// Mirrors a normalized relational schema (see /docs/database-schema.sql for the
// production PostgreSQL DDL). This file is the single source of truth for shapes
// used across the JSON-backed data layer in development.

export type Role = "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface User {
  id: string;
  role: Role;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  gender?: Gender;
  dateOfBirth?: string; // ISO date
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientProfile {
  userId: string;
  patientCode: string; // Digital health card number, e.g. MCH-2026-000123
  address?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  chronicConditions?: string;
  insuranceProvider?: string;
  insurancePolicyNo?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export type DoctorDay = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export interface DoctorAvailability {
  day: DoctorDay;
  startTime: string; // "09:00"
  endTime: string; // "13:00"
  slotMinutes: number; // default appointment slot length
}

export interface DoctorProfile {
  userId: string;
  departmentId: string;
  specialization: string;
  qualification: string;
  registrationNo: string;
  consultationFee: number;
  yearsExperience: number;
  bio?: string;
  availability: DoctorAvailability[];
  onLeaveDates: string[]; // ISO dates the doctor is unavailable
}

export type AppointmentType = "ONLINE" | "WALK_IN" | "FOLLOW_UP" | "EMERGENCY";
export type AppointmentStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: string;
  tokenNumber: number; // daily token, per doctor
  patientId: string; // User.id
  doctorId: string; // User.id
  departmentId: string;
  date: string; // ISO date, e.g. "2026-07-24"
  startTime: string; // "09:30"
  endTime: string; // "09:45"
  type: AppointmentType;
  status: AppointmentStatus;
  reasonForVisit: string;
  createdBy: string; // User.id of who booked it (patient, receptionist)
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
}

export interface ConsultationNote {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  diagnosis: string;
  notes: string;
  createdAt: string;
}

export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  items: PrescriptionItem[];
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  detail?: string;
  createdAt: string;
}

export interface Database {
  users: User[];
  patientProfiles: PatientProfile[];
  departments: Department[];
  doctorProfiles: DoctorProfile[];
  appointments: Appointment[];
  consultationNotes: ConsultationNote[];
  prescriptions: Prescription[];
  auditLogs: AuditLogEntry[];
}
