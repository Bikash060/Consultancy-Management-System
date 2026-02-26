export interface User {
    id: number;
    email: string;
    phone: string | null;
    role: 'client' | 'counselor' | 'admin';
    is_active: boolean;
    created_at: string;
    profile: Profile | null;
}

export interface Profile {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    address: string | null;
    education_background: string | null;
    preferred_country: string | null;
    preferred_course: string | null;
    budget: number | null;
    passport_number: string | null;
}

export interface Appointment {
    id: number;
    client_id: number;
    counselor_id: number;
    scheduled_at: string;
    type: 'online' | 'offline';
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    notes: string | null;
    created_at: string;
}

export interface Document {
    id: number;
    user_id: number;
    type: 'passport' | 'transcript' | 'sop' | 'bank_statement' | 'recommendation' | 'certificate' | 'other';
    file_name: string;
    status: 'pending' | 'verified' | 'rejected' | 'needs_correction';
    comments: string | null;
    uploaded_at: string;
    verified_at: string | null;
}

export interface Application {
    id: number;
    client_id: number;
    counselor_id: number;
    university: string | null;
    country: string;
    course: string | null;
    intake: string | null;
    status: string;
    created_at: string;
    stages: ApplicationStage[];
}

export interface ApplicationStage {
    id: number;
    stage_name: string;
    status: 'pending' | 'in_progress' | 'completed';
    notes: string | null;
    completed_at: string | null;
}

export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    is_read: boolean;
    sent_at: string;
}
