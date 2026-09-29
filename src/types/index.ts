export type UserRole = 'student' | 'organizer' | 'admin';

export interface Profile {
  id: string;
  name: string;
  email: string;
  register_number: string;
  department: string;
  year?: string;
  phone?: string;
  role: UserRole;
  profile_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  status: boolean;
  created_at?: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description?: string;
  status: boolean;
  created_at?: string;
}

export type EventStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface EventSchedule {
  id: string;
  event_id: string;
  schedule_time: string;
  title: string;
  description?: string;
  created_at?: string;
}

export interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  category_id: string;
  category?: Category;
  poster_url?: string;
  date: string;
  start_time: string;
  end_time: string;
  venue_id: string;
  venue?: Venue;
  organizer_id: string;
  organizer?: Profile;
  department: string;
  eligibility: string;
  max_participants: number;
  registration_fee: number;
  registration_deadline: string;
  rules?: string;
  status: EventStatus;
  created_at: string;
  updated_at?: string;
  schedules?: EventSchedule[];
  registered_count?: number;
}

export type RegistrationStatus = 'confirmed' | 'cancelled' | 'attended';
export type PaymentStatus = 'free' | 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'student_wallet' | 'wallet';

export interface PaymentTransaction {
  id: string;
  registration_id: string;
  event_id: string;
  student_id: string;
  student_name?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_method_detail: string;
  transaction_ref: string;
  status: 'success' | 'failed' | 'pending';
  created_at: string;
}

export interface Registration {
  id: string;
  registration_id: string;
  event_id: string;
  event?: CollegeEvent;
  student_id: string;
  student?: Profile;
  registered_at: string;
  status: RegistrationStatus;
  payment_status: PaymentStatus;
  amount_paid?: number;
  payment_method?: string;
  transaction_ref?: string;
}

export interface Attendance {
  id: string;
  event_id: string;
  student_id: string;
  registration_id: string;
  check_in_time: string;
  status: 'present' | 'absent';
  student?: Profile;
  event?: CollegeEvent;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  type: 'event' | 'registration' | 'reminder' | 'announcement' | 'system';
  is_read: boolean;
  created_at: string;
  link?: string;
  action_label?: string;
  metadata?: {
    eventId?: string;
    registrationId?: string;
    eventTitle?: string;
    status?: string;
    amount?: number;
  };
}

export interface QRVerificationResult {
  valid: boolean;
  message: string;
  registration?: Registration;
  event?: CollegeEvent;
  student?: Profile;
  checkInTime?: string;
}
