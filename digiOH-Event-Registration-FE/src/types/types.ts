export interface Guest {
    id: number;
    username: string;
    email: string;
    phoneNum: string;
    confirmation: string;
    attendance: string;
    emailed: boolean;
    instansi: string;
    merchandise: string;
    merchandise_updated_by?: string;
    attributes?: { [key: string]: string };
    confirmation_updated_by?: string;
    attendance_updated_by?: string;
    attributes_updated_by?: string;
    email_sent_by?: string;
}

export interface Event {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    sales: string;
    account_manager: string;
    company?: string;
    event_time?: string;
    loading_date?: Date;
    discord_channel?: string;
    drive_folder?: string;
    location?: string;
    last_updated_by?: string;
    last_updated_at?: Date;
}

export interface User {
    email: string;
}
