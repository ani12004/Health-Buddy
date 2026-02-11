export type UserRole = 'patient' | 'doctor';

export interface UserProfile {
    id: string;
    email: string;
    role: UserRole;
    full_name: string;
    avatar_url?: string;
    created_at: string;
}

export interface Patient {
    id: string; // references profile.id
    dob: string;
    blood_type: string;
    allergies: string[]; // Stored as JSONB
    conditions: string[]; // Stored as JSONB
}

export interface Doctor {
    id: string; // references profile.id
    specialty: string;
    license_number: string;
    hospital_affiliation?: string;
}

export interface Report {
    id: string;
    patient_id: string;
    doctor_id: string;
    title: string;
    type: 'lab' | 'diagnosis' | 'prescription';
    content: any;
    file_url?: string;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    session_id: string;
    sender: 'user' | 'ai';
    message: string;
    created_at: string;
}
