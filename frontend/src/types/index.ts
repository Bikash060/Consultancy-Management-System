export interface User {
    id: number;
    email: string;
    phone: string | null;
    role: 'client' | 'counselor' | 'admin';
    is_active: boolean;
    profile_setup: boolean;
    assigned_counselor_id: number | null;
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
    father_name: string | null;
    mother_name: string | null;
    parent_phone: string | null;
    parent_email: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country_of_residence: string | null;
    neb_gpa: string | null;
    neb_stream: string | null;
    neb_year: string | null;
    neb_school: string | null;
    bachelors_university: string | null;
    bachelors_course: string | null;
    bachelors_gpa: string | null;
    english_test_type: string | null;
    english_test_score: string | null;
    interests: string | null;
    career_goals: string | null;
    gender: string | null;
    nationality: string | null;
    marital_status: string | null;
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
    download_url: string | null;
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

export interface Intake {
    id: number;
    name: string;
    year: number;
    is_active: boolean;
    created_at: string;
}
