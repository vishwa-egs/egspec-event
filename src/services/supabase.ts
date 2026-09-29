import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { firestoreApi } from './firestoreService';
import {
  Profile,
  Category,
  Venue,
  CollegeEvent,
  EventSchedule,
  Registration,
  Attendance,
  NotificationItem,
  QRVerificationResult,
  PaymentTransaction,
  EventStatus,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_CATEGORIES,
  INITIAL_VENUES,
  INITIAL_EVENTS,
  INITIAL_SCHEDULES,
  INITIAL_REGISTRATIONS,
  INITIAL_ATTENDANCE,
  INITIAL_NOTIFICATIONS
} from './mockData';

export const isFirebaseConfigured = true;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your_supabase')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================================
// REACTIVE LOCAL STORAGE REPOSITORY (Fallback & Offline-ready for VS Code demo)
// ============================================================================

const STORAGE_KEYS = {
  PROFILES: 'egspec_profiles_v1',
  CATEGORIES: 'egspec_categories_v1',
  VENUES: 'egspec_venues_v1',
  EVENTS: 'egspec_events_v1',
  SCHEDULES: 'egspec_schedules_v1',
  REGISTRATIONS: 'egspec_registrations_v1',
  ATTENDANCE: 'egspec_attendance_v1',
  NOTIFICATIONS: 'egspec_notifications_v1',
  PAYMENTS: 'egspec_payments_v1',
  CURRENT_USER: 'egspec_auth_user_v1'
};

function loadFromStorage<T>(key: string, initialData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return initialData;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('egspec_data_update', { detail: { key } }));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// Memory repositories initialized from localStorage / initial seed
let profiles: Profile[] = loadFromStorage(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
let categories: Category[] = loadFromStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
let venues: Venue[] = loadFromStorage(STORAGE_KEYS.VENUES, INITIAL_VENUES);
let events: CollegeEvent[] = loadFromStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
let schedules: EventSchedule[] = loadFromStorage(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
let registrations: Registration[] = loadFromStorage(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
let attendance: Attendance[] = loadFromStorage(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
let notifications: NotificationItem[] = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
let payments: PaymentTransaction[] = loadFromStorage(STORAGE_KEYS.PAYMENTS, []);

// Live synchronization with Firebase Firestore
async function syncFirestoreData() {
  try {
    const [eventsSnap, categoriesSnap, venuesSnap, regsSnap, attSnap, notifsSnap, paymentsSnap] = await Promise.all([
      getDocs(collection(db, 'events')),
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'venues')),
      getDocs(collection(db, 'registrations')),
      getDocs(collection(db, 'attendance')),
      getDocs(collection(db, 'notifications')),
      getDocs(collection(db, 'payments')),
    ]);

    let hasChanges = false;
    if (!eventsSnap.empty) {
      events = eventsSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as CollegeEvent[];
      saveToStorage(STORAGE_KEYS.EVENTS, events);
      hasChanges = true;
    }
    if (!categoriesSnap.empty) {
      categories = categoriesSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as Category[];
      saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
      hasChanges = true;
    }
    if (!venuesSnap.empty) {
      venues = venuesSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as Venue[];
      saveToStorage(STORAGE_KEYS.VENUES, venues);
      hasChanges = true;
    }
    if (!regsSnap.empty) {
      registrations = regsSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as Registration[];
      saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);
      hasChanges = true;
    }
    if (!attSnap.empty) {
      attendance = attSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as Attendance[];
      saveToStorage(STORAGE_KEYS.ATTENDANCE, attendance);
      hasChanges = true;
    }
    if (!notifsSnap.empty) {
      notifications = notifsSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as NotificationItem[];
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
      hasChanges = true;
    }
    if (!paymentsSnap.empty) {
      payments = paymentsSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as PaymentTransaction[];
      saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
      hasChanges = true;
    }
    if (hasChanges) {
      window.dispatchEvent(new CustomEvent('egspec_data_update'));
    }
  } catch (err) {
    console.log('Firestore initial synchronization check:', err);
  }
}

syncFirestoreData();

// Helper to attach relations
function enrichEvent(ev: CollegeEvent): CollegeEvent {
  const cat = categories.find((c) => c.id === ev.category_id);
  const ven = venues.find((v) => v.id === ev.venue_id);
  const org = profiles.find((p) => p.id === ev.organizer_id);
  const sched = schedules.filter((s) => s.event_id === ev.id);
  const regCount = registrations.filter((r) => r.event_id === ev.id && r.status === 'confirmed').length;

  return {
    ...ev,
    category: cat,
    venue: ven,
    organizer: org,
    schedules: sched,
    registered_count: regCount,
  };
}

function enrichRegistration(reg: Registration): Registration {
  const ev = events.find((e) => e.id === reg.event_id);
  const student = profiles.find((p) => p.id === reg.student_id);
  return {
    ...reg,
    event: ev ? enrichEvent(ev) : undefined,
    student,
  };
}

// ============================================================================
// UNIFIED PORTAL API SERVICE
// ============================================================================

export const portalApi = {
  // --- AUTHENTICATION ---
  async getCurrentUser(): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      return profile || null;
    }
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!stored) {
      // Default to student Vishwa for immediate preview
      const defaultUser = profiles[0];
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return profiles[0];
    }
  },

  async signIn(email: string, _password?: string): Promise<{ user: Profile; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: _password || 'password123',
      });
      if (error) return { user: {} as Profile, error: error.message };
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      return { user: profile };
    }

    // Lookup by email or register number
    const found = profiles.find(
      (p) =>
        p.email.toLowerCase() === email.toLowerCase() ||
        p.register_number?.toLowerCase() === email.toLowerCase()
    );

    if (!found) {
      return { user: {} as Profile, error: 'Invalid credentials or user not found. Try one of the demo users!' };
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
    window.dispatchEvent(new CustomEvent('egspec_auth_state_change', { detail: found }));
    return { user: found };
  },

  async signUp(userData: Partial<Profile>, _password?: string): Promise<{ user: Profile; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password: _password || 'password123',
      });
      if (error) return { user: {} as Profile, error: error.message };
      const newProfile: Profile = {
        id: data.user!.id,
        name: userData.name || '',
        email: userData.email!,
        register_number: userData.register_number || '',
        department: userData.department || 'CSE',
        year: userData.year || '1st Year',
        phone: userData.phone || '',
        role: userData.role || 'student',
        profile_image: '',
        created_at: new Date().toISOString(),
      };
      await supabase.from('profiles').insert(newProfile);
      return { user: newProfile };
    }

    const existing = profiles.find((p) => p.email.toLowerCase() === userData.email?.toLowerCase());
    if (existing) {
      return { user: {} as Profile, error: 'A user with this email already exists.' };
    }

    const newProfile: Profile = {
      id: 'u' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      name: userData.name || '',
      email: userData.email!,
      register_number: userData.register_number || `REG-${Date.now().toString().slice(-6)}`,
      department: userData.department || 'CSE',
      year: userData.year || '1st Year',
      phone: userData.phone || '',
      role: userData.role || 'student',
      profile_image: '',
      created_at: new Date().toISOString(),
    };

    profiles.push(newProfile);
    saveToStorage(STORAGE_KEYS.PROFILES, profiles);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newProfile));
    window.dispatchEvent(new CustomEvent('egspec_auth_state_change', { detail: newProfile }));
    return { user: newProfile };
  },

  async switchDemoUser(role: 'student' | 'organizer' | 'admin'): Promise<Profile> {
    const target = profiles.find((p) => p.role === role) || profiles[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(target));
    window.dispatchEvent(new CustomEvent('egspec_auth_state_change', { detail: target }));
    return target;
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.dispatchEvent(new CustomEvent('egspec_auth_state_change', { detail: null }));
  },

  // --- EVENTS ---
  async getEvents(options?: {
    status?: string;
    category?: string;
    department?: string;
    venue?: string;
    price?: 'all' | 'free' | 'paid';
    search?: string;
    organizerId?: string;
    sortBy?: 'upcoming' | 'newest' | 'popular';
  }): Promise<CollegeEvent[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('events').select('*, category:categories(*), venue:venues(*), organizer:profiles(*)');
      if (options?.status) query = query.eq('status', options.status);
      if (options?.category) query = query.eq('category_id', options.category);
      if (options?.organizerId) query = query.eq('organizer_id', options.organizerId);
      const { data, error } = await query;
      if (!error && data) return data as CollegeEvent[];
    }

    let result = events.map(enrichEvent);

    if (options?.status) {
      result = result.filter((e) => e.status === options.status);
    }
    if (options?.category && options.category !== 'all') {
      const catFilter = options.category.toLowerCase();
      result = result.filter((e) => e.category_id === options.category || e.category?.name.toLowerCase() === catFilter);
    }
    if (options?.department && options.department !== 'all') {
      const deptFilter = options.department.toLowerCase();
      result = result.filter((e) => e.department.toLowerCase() === deptFilter);
    }
    if (options?.venue && options.venue !== 'all') {
      const venFilter = options.venue.toLowerCase();
      result = result.filter((e) => e.venue_id === options.venue || (e.venue?.name && e.venue.name.toLowerCase().includes(venFilter)));
    }
    if (options?.price === 'free') {
      result = result.filter((e) => Number(e.registration_fee) === 0);
    } else if (options?.price === 'paid') {
      result = result.filter((e) => Number(e.registration_fee) > 0);
    }
    if (options?.organizerId) {
      result = result.filter((e) => e.organizer_id === options.organizerId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.category?.name.toLowerCase().includes(q) ||
          e.venue?.name.toLowerCase().includes(q)
      );
    }

    if (options?.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (options?.sortBy === 'popular') {
      result.sort((a, b) => (b.registered_count || 0) - (a.registered_count || 0));
    } else {
      // default: upcoming date
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return result;
  },

  async getEventById(id: string): Promise<CollegeEvent | null> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('events')
        .select('*, category:categories(*), venue:venues(*), organizer:profiles(*)')
        .eq('id', id)
        .single();
      if (data) return data as CollegeEvent;
    }
    const found = events.find((e) => e.id === id);
    return found ? enrichEvent(found) : null;
  },

  async createEvent(eventData: Partial<CollegeEvent>, scheduleList?: Array<{ schedule_time: string; title: string; description?: string }>): Promise<CollegeEvent> {
    const newId = 'e' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newEvent: CollegeEvent = {
      id: newId,
      title: eventData.title || 'Untitled Event',
      description: eventData.description || '',
      category_id: eventData.category_id || categories[0].id,
      poster_url: eventData.poster_url || '',
      date: eventData.date || new Date().toISOString().split('T')[0],
      start_time: eventData.start_time || '09:30',
      end_time: eventData.end_time || '16:30',
      venue_id: eventData.venue_id || venues[0].id,
      organizer_id: eventData.organizer_id || profiles[1].id,
      department: eventData.department || 'CSE',
      eligibility: eventData.eligibility || 'Open to all departments',
      max_participants: Number(eventData.max_participants) || 100,
      registration_fee: Number(eventData.registration_fee) || 0,
      registration_deadline: eventData.registration_deadline || new Date(Date.now() + 86400000 * 7).toISOString(),
      rules: eventData.rules || '1. Valid college ID card required.',
      status: eventData.status || 'pending',
      created_at: new Date().toISOString(),
    };

    events.unshift(newEvent);
    saveToStorage(STORAGE_KEYS.EVENTS, events);
    // Persist to Firebase Firestore
    setDoc(doc(db, 'events', newId), newEvent).catch((err) =>
      console.warn('Firestore createEvent notice:', err)
    );

    if (scheduleList && scheduleList.length > 0) {
      const newSchedules: EventSchedule[] = scheduleList.map((s, idx) => ({
        id: `s-${newId}-${idx}`,
        event_id: newId,
        schedule_time: s.schedule_time,
        title: s.title,
        description: s.description || '',
        created_at: new Date().toISOString()
      }));
      schedules.push(...newSchedules);
      saveToStorage(STORAGE_KEYS.SCHEDULES, schedules);
      newSchedules.forEach((sch) => {
        setDoc(doc(db, 'schedules', sch.id), sch).catch((err) =>
          console.warn('Firestore schedule notice:', err)
        );
      });
    }

    // Notify admins about new event submitted
    const adminNotif: NotificationItem = {
      id: 'n-' + Date.now(),
      recipient_id: profiles.find((p) => p.role === 'admin')?.id || profiles[2].id,
      title: 'New Event Awaiting Approval',
      message: `"${newEvent.title}" submitted by ${profiles.find((p) => p.id === newEvent.organizer_id)?.name || 'Organizer'}.`,
      type: 'event',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notifications.unshift(adminNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    setDoc(doc(db, 'notifications', adminNotif.id), adminNotif).catch(() => {});

    return enrichEvent(newEvent);
  },

  async updateEvent(id: string, updates: Partial<CollegeEvent>): Promise<CollegeEvent | null> {
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], ...updates, updated_at: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.EVENTS, events);
    // Persist to Firebase Firestore
    updateDoc(doc(db, 'events', id), updates).catch((err) =>
      console.warn('Firestore updateEvent notice:', err)
    );
    return enrichEvent(events[idx]);
  },

  async deleteEvent(id: string): Promise<boolean> {
    const initialLen = events.length;
    events = events.filter((e) => e.id !== id);
    registrations = registrations.filter((r) => r.event_id !== id);
    saveToStorage(STORAGE_KEYS.EVENTS, events);
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);
    // Delete from Firebase Firestore
    deleteDoc(doc(db, 'events', id)).catch((err) =>
      console.warn('Firestore deleteEvent notice:', err)
    );
    return events.length < initialLen;
  },

  async approveEvent(id: string): Promise<CollegeEvent | null> {
    return this.changeEventStatus(id, 'approved');
  },

  async rejectEvent(id: string, reason?: string): Promise<CollegeEvent | null> {
    return this.changeEventStatus(id, 'rejected', reason);
  },

  async changeEventStatus(
    id: string,
    newStatus: EventStatus,
    reasonOrNote?: string
  ): Promise<CollegeEvent | null> {
    const ev = events.find((e) => e.id === id);
    if (!ev) return null;
    const oldStatus = ev.status;
    const updated = await this.updateEvent(id, { status: newStatus });
    if (!updated) return null;

    const now = new Date().toISOString();
    const newNotifs: NotificationItem[] = [];

    // 1. Notify the event organizer if status changed
    let orgMsg = `Status for your event "${updated.title}" changed from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}.`;
    if (newStatus === 'approved') {
      orgMsg = `Your event "${updated.title}" has been approved by the Dean Office and is now live for student registrations.`;
    } else if (newStatus === 'rejected') {
      orgMsg = `Your event "${updated.title}" proposal was rejected by the Dean Office. ${reasonOrNote ? `Feedback: ${reasonOrNote}` : 'Please review event guidelines and resubmit.'}`;
    } else if (newStatus === 'cancelled') {
      orgMsg = `Event "${updated.title}" was marked as CANCELLED. ${reasonOrNote ? `Notice: ${reasonOrNote}` : 'Registered participants have been notified.'}`;
    } else if (newStatus === 'completed') {
      orgMsg = `Event "${updated.title}" has concluded. You can review attendance and download participation reports.`;
    }

    const orgNotif: NotificationItem = {
      id: `n-${Date.now()}-org`,
      recipient_id: updated.organizer_id,
      title: `Event Status Update: ${newStatus.toUpperCase()}`,
      message: orgMsg,
      type: 'event',
      is_read: false,
      created_at: now,
      link: `/events/${updated.id}`,
      action_label: 'View Event',
      metadata: {
        eventId: updated.id,
        eventTitle: updated.title,
        status: newStatus,
      },
    };
    newNotifs.push(orgNotif);

    // 2. If approved, announce to students
    if (newStatus === 'approved') {
      const studentProfiles = profiles.filter((p) => p.role === 'student');
      studentProfiles.forEach((st, idx) => {
        newNotifs.push({
          id: `n-${Date.now()}-st-${idx}`,
          recipient_id: st.id,
          title: `New Event: ${updated.title}`,
          message: `Registrations are open for "${updated.title}" on ${updated.date} at ${updated.venue?.name || 'campus'}. Seats: ${updated.max_participants}.`,
          type: 'event',
          is_read: false,
          created_at: now,
          link: `/events/${updated.id}`,
          action_label: 'Explore & Register',
          metadata: {
            eventId: updated.id,
            eventTitle: updated.title,
            status: newStatus,
          },
        });
      });
    }

    // 3. If cancelled, completed, or status changed: notify all registered students!
    if (newStatus === 'cancelled' || newStatus === 'completed' || newStatus === 'rejected') {
      const registeredList = registrations.filter(
        (r) => r.event_id === id && r.status === 'confirmed'
      );

      registeredList.forEach((reg, idx) => {
        let studentTitle = `Event Status: ${updated.title}`;
        let studentMsg = `The status of "${updated.title}" has changed to ${newStatus.toUpperCase()}.`;

        if (newStatus === 'cancelled') {
          studentTitle = `⚠️ Event Cancelled: ${updated.title}`;
          studentMsg = `Important Notice: "${updated.title}" scheduled for ${updated.date} has been cancelled by college administration. ${reasonOrNote ? `Reason: ${reasonOrNote}. ` : ''}Your pass has been cancelled and any fees will be credited back.`;
        } else if (newStatus === 'completed') {
          studentTitle = `✓ Event Concluded: ${updated.title}`;
          studentMsg = `"${updated.title}" has successfully concluded. Thank you for attending! Keep your E-Pass for attendance credit.`;
        }

        newNotifs.push({
          id: `n-${Date.now()}-reg-${idx}`,
          recipient_id: reg.student_id,
          title: studentTitle,
          message: studentMsg,
          type: 'event',
          is_read: false,
          created_at: now,
          link: `/events/${updated.id}`,
          action_label: 'View Event',
          metadata: {
            eventId: updated.id,
            registrationId: reg.registration_id,
            eventTitle: updated.title,
            status: newStatus,
          },
        });
      });
    }

    // Save and persist all notifications
    notifications.unshift(...newNotifs);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    newNotifs.forEach((item) => {
      setDoc(doc(db, 'notifications', item.id), item).catch(() => {});
      window.dispatchEvent(new CustomEvent('egspec_notification_alert', { detail: item }));
    });

    return updated;
  },

  // --- REGISTRATIONS & TICKETS ---
  async registerForEvent(
    eventId: string,
    studentId: string,
    paymentInfo?: {
      amount?: number;
      payment_method?: string;
      transaction_ref?: string;
    }
  ): Promise<{ success: boolean; registration?: Registration; error?: string }> {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return { success: false, error: 'Event not found.' };
    if (ev.status !== 'approved') return { success: false, error: 'Event is not currently approved for registrations.' };

    // Check deadline
    if (new Date(ev.registration_deadline).getTime() < Date.now()) {
      return { success: false, error: 'Registration deadline has passed.' };
    }

    // Check duplicate
    const existing = registrations.find(
      (r) => r.event_id === eventId && r.student_id === studentId && r.status !== 'cancelled'
    );
    if (existing) {
      return { success: false, error: 'You are already registered for this event.', registration: enrichRegistration(existing) };
    }

    // Check capacity
    const currentCount = registrations.filter((r) => r.event_id === eventId && r.status === 'confirmed').length;
    if (currentCount >= ev.max_participants) {
      return { success: false, error: 'Event capacity reached. No seats available.' };
    }

    // Generate unique registration ID: EVT-2026-XXXXXX
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const regId = `EVT-2026-${randomCode}`;
    const fee = Number(ev.registration_fee) || 0;
    const isPaidEvent = fee > 0;
    const txnRef = paymentInfo?.transaction_ref || (isPaidEvent ? `TXN-EGS-2026-${Math.floor(100000 + Math.random() * 900000)}` : undefined);
    const payMethod = paymentInfo?.payment_method || (isPaidEvent ? 'UPI' : 'Free Registration');

    const newReg: Registration = {
      id: 'r' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      registration_id: regId,
      event_id: eventId,
      student_id: studentId,
      registered_at: new Date().toISOString(),
      status: 'confirmed',
      payment_status: isPaidEvent ? 'paid' : 'free',
      amount_paid: fee,
      payment_method: payMethod,
      transaction_ref: txnRef,
    };

    registrations.unshift(newReg);
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);
    // Persist to Firebase Firestore
    setDoc(doc(db, 'registrations', newReg.id), newReg).catch((err) =>
      console.warn('Firestore registration write notice:', err)
    );

    // If payment occurred, record transaction
    if (isPaidEvent && txnRef) {
      const studentProfile = profiles.find((p) => p.id === studentId);
      const newPayment: PaymentTransaction = {
        id: 'pay-' + Date.now(),
        registration_id: regId,
        event_id: eventId,
        student_id: studentId,
        student_name: studentProfile?.name || 'Student',
        amount: fee,
        currency: 'INR',
        payment_method: 'upi',
        payment_method_detail: payMethod,
        transaction_ref: txnRef,
        status: 'success',
        created_at: new Date().toISOString(),
      };
      payments.unshift(newPayment);
      saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
      setDoc(doc(db, 'payments', newPayment.id), newPayment).catch((err) =>
        console.warn('Firestore payment record notice:', err)
      );
    }

    // Create notification for student
    const studentProfile = profiles.find((p) => p.id === studentId);
    const studentNotif: NotificationItem = {
      id: 'n-' + Date.now(),
      recipient_id: studentId,
      title: 'Registration Confirmed!',
      message: `Your seat for "${ev.title}" is confirmed. Admission ID: ${regId}. Access your digital QR ticket anytime in My Tickets.`,
      type: 'registration',
      is_read: false,
      created_at: new Date().toISOString(),
      link: '/my-tickets',
      action_label: 'View E-Pass Ticket',
      metadata: {
        eventId,
        registrationId: regId,
        eventTitle: ev.title,
        status: 'confirmed',
        amount: fee,
      },
    };
    notifications.unshift(studentNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    setDoc(doc(db, 'notifications', studentNotif.id), studentNotif).catch(() => {});
    window.dispatchEvent(new CustomEvent('egspec_notification_alert', { detail: studentNotif }));

    // Also notify organizer about new registration
    const orgNotif: NotificationItem = {
      id: 'n-' + (Date.now() + 1),
      recipient_id: ev.organizer_id,
      title: 'New Event Registration',
      message: `${studentProfile?.name || 'A student'} (${studentProfile?.register_number || 'Student'}) registered for "${ev.title}". Total: ${(currentCount + 1)} / ${ev.max_participants}.`,
      type: 'registration',
      is_read: false,
      created_at: new Date().toISOString(),
      link: `/organizer/attendance?eventId=${eventId}`,
      action_label: 'View Roster',
      metadata: {
        eventId,
        registrationId: regId,
        eventTitle: ev.title,
        status: 'confirmed',
      },
    };
    notifications.unshift(orgNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    setDoc(doc(db, 'notifications', orgNotif.id), orgNotif).catch(() => {});
    window.dispatchEvent(new CustomEvent('egspec_notification_alert', { detail: orgNotif }));

    return { success: true, registration: enrichRegistration(newReg) };
  },

  async getMyRegistrations(studentId: string): Promise<Registration[]> {
    return registrations
      .filter((r) => r.student_id === studentId)
      .map(enrichRegistration)
      .sort((a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime());
  },

  async cancelRegistration(registrationId: string): Promise<boolean> {
    const reg = registrations.find((r) => r.id === registrationId || r.registration_id === registrationId);
    if (!reg) return false;
    reg.status = 'cancelled';
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);
    // Update in Firebase Firestore
    updateDoc(doc(db, 'registrations', reg.id), { status: 'cancelled' }).catch((err) =>
      console.warn('Firestore cancelRegistration notice:', err)
    );

    notifications.unshift({
      id: 'n-' + Date.now(),
      recipient_id: reg.student_id,
      title: 'Registration Cancelled',
      message: `Registration ${reg.registration_id} for event has been cancelled.`,
      type: 'registration',
      is_read: false,
      created_at: new Date().toISOString(),
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);

    return true;
  },

  // --- QR VERIFICATION & ATTENDANCE ---
  async verifyQRTicket(payloadOrCode: string, targetEventId?: string): Promise<QRVerificationResult> {
    let cleanCode = payloadOrCode.trim();

    // In case QR contains JSON payload
    try {
      if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
        const parsed = JSON.parse(cleanCode);
        if (parsed.registration_id) cleanCode = parsed.registration_id;
      }
    } catch {
      // not JSON, keep as is
    }

    const reg = registrations.find(
      (r) => r.registration_id.toLowerCase() === cleanCode.toLowerCase() || r.id === cleanCode
    );

    if (!reg) {
      return { valid: false, message: '✕ Invalid Ticket: Registration record not found in system.' };
    }

    const enriched = enrichRegistration(reg);

    if (reg.status === 'cancelled') {
      return {
        valid: false,
        message: '✕ Invalid Ticket: This registration has been CANCELLED.',
        registration: enriched,
        event: enriched.event,
        student: enriched.student,
      };
    }

    if (targetEventId && reg.event_id !== targetEventId) {
      return {
        valid: false,
        message: `✕ Wrong Event: Ticket belongs to "${enriched.event?.title || 'Another Event'}", not this event!`,
        registration: enriched,
        event: enriched.event,
        student: enriched.student,
      };
    }

    // Check duplicate check-in
    const alreadyAttended = attendance.find((a) => a.registration_id === reg.id && a.status === 'present');
    if (alreadyAttended) {
      return {
        valid: true,
        message: `ℹ Already Checked In at ${new Date(alreadyAttended.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        registration: enriched,
        event: enriched.event,
        student: enriched.student,
        checkInTime: alreadyAttended.check_in_time,
      };
    }

    // Record attendance
    const newAttendance: Attendance = {
      id: 'a' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      event_id: reg.event_id,
      student_id: reg.student_id,
      registration_id: reg.id,
      check_in_time: new Date().toISOString(),
      status: 'present',
    };

    attendance.push(newAttendance);
    reg.status = 'attended';
    saveToStorage(STORAGE_KEYS.ATTENDANCE, attendance);
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);

    // Persist check-in to Firebase Firestore
    setDoc(doc(db, 'attendance', newAttendance.id), newAttendance).catch((err) =>
      console.warn('Firestore attendance write notice:', err)
    );
    updateDoc(doc(db, 'registrations', reg.id), { status: 'attended' }).catch((err) =>
      console.warn('Firestore registration update notice:', err)
    );

    return {
      valid: true,
      message: '✓ Attendance Confirmed! Welcome to the event.',
      registration: enriched,
      event: enriched.event,
      student: enriched.student,
      checkInTime: newAttendance.check_in_time,
    };
  },

  async getAttendanceForEvent(eventId: string): Promise<Attendance[]> {
    return attendance
      .filter((a) => a.event_id === eventId)
      .map((a) => ({
        ...a,
        student: profiles.find((p) => p.id === a.student_id),
        event: events.find((e) => e.id === a.event_id),
      }));
  },

  async getParticipantsForEvent(eventId: string): Promise<Array<Registration & { attendance?: Attendance }>> {
    const list = registrations.filter((r) => r.event_id === eventId).map(enrichRegistration);
    return list.map((reg) => ({
      ...reg,
      attendance: attendance.find((a) => a.registration_id === reg.id),
    }));
  },

  // --- CATEGORIES & VENUES ---
  async getCategories(): Promise<Category[]> {
    return categories;
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const newCat: Category = {
      id: 'c' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      name: cat.name || 'New Category',
      description: cat.description || '',
      icon: cat.icon || 'Sparkles',
      status: true,
      created_at: new Date().toISOString(),
    };
    categories.push(newCat);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    // Persist to Firebase Firestore
    setDoc(doc(db, 'categories', newCat.id), newCat).catch((err) =>
      console.warn('Firestore createCategory notice:', err)
    );
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    categories[idx] = { ...categories[idx], ...updates };
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    updateDoc(doc(db, 'categories', id), updates).catch((err) =>
      console.warn('Firestore updateCategory notice:', err)
    );
    return categories[idx];
  },

  async deleteCategory(id: string): Promise<boolean> {
    categories = categories.filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    deleteDoc(doc(db, 'categories', id)).catch((err) =>
      console.warn('Firestore deleteCategory notice:', err)
    );
    return true;
  },

  async getVenues(): Promise<Venue[]> {
    return venues;
  },

  async createVenue(v: Partial<Venue>): Promise<Venue> {
    const newVenue: Venue = {
      id: 'v' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      name: v.name || 'New Venue',
      location: v.location || 'Main Campus',
      capacity: Number(v.capacity) || 100,
      description: v.description || '',
      status: true,
      created_at: new Date().toISOString(),
    };
    venues.push(newVenue);
    saveToStorage(STORAGE_KEYS.VENUES, venues);
    // Persist to Firebase Firestore
    setDoc(doc(db, 'venues', newVenue.id), newVenue).catch((err) =>
      console.warn('Firestore createVenue notice:', err)
    );
    return newVenue;
  },

  async updateVenue(id: string, updates: Partial<Venue>): Promise<Venue | null> {
    const idx = venues.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    venues[idx] = { ...venues[idx], ...updates };
    saveToStorage(STORAGE_KEYS.VENUES, venues);
    updateDoc(doc(db, 'venues', id), updates).catch((err) =>
      console.warn('Firestore updateVenue notice:', err)
    );
    return venues[idx];
  },

  async deleteVenue(id: string): Promise<boolean> {
    venues = venues.filter((v) => v.id !== id);
    saveToStorage(STORAGE_KEYS.VENUES, venues);
    deleteDoc(doc(db, 'venues', id)).catch((err) =>
      console.warn('Firestore deleteVenue notice:', err)
    );
    return true;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(recipientId: string): Promise<NotificationItem[]> {
    return notifications
      .filter((n) => n.recipient_id === recipientId || n.recipient_id === 'all')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const notif = notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
      updateDoc(doc(db, 'notifications', id), { is_read: true }).catch(() => {});
    }
  },

  async markAllNotificationsAsRead(recipientId: string): Promise<void> {
    notifications.forEach((n) => {
      if (n.recipient_id === recipientId || n.recipient_id === 'all') {
        n.is_read = true;
        updateDoc(doc(db, 'notifications', n.id), { is_read: true }).catch(() => {});
      }
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  async deleteNotification(id: string): Promise<boolean> {
    const initialLen = notifications.length;
    notifications = notifications.filter((n) => n.id !== id);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    deleteDoc(doc(db, 'notifications', id)).catch(() => {});
    return notifications.length < initialLen;
  },

  async clearAllNotifications(recipientId: string): Promise<void> {
    notifications = notifications.filter(
      (n) => n.recipient_id !== recipientId && n.recipient_id !== 'all'
    );
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  async createNotification(
    recipientId: string,
    title: string,
    message: string,
    type: NotificationItem['type'] = 'system',
    link?: string,
    action_label?: string,
    metadata?: NotificationItem['metadata']
  ): Promise<NotificationItem> {
    const newId = `n-${Date.now()}`;
    const item: NotificationItem = {
      id: newId,
      recipient_id: recipientId,
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
      link,
      action_label,
      metadata,
    };
    notifications.unshift(item);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    setDoc(doc(db, 'notifications', newId), item).catch(() => {});
    window.dispatchEvent(new CustomEvent('egspec_notification_alert', { detail: item }));
    return item;
  },

  async sendBroadcastNotification(title: string, message: string, type: NotificationItem['type'], targetRole: 'all' | 'student' | 'organizer'): Promise<number> {
    let targets = profiles;
    if (targetRole !== 'all') {
      targets = targets.filter((p) => p.role === targetRole);
    }
    const newItems: NotificationItem[] = targets.map((t, idx) => ({
      id: `n-${Date.now()}-${idx}`,
      recipient_id: t.id,
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    notifications.unshift(...newItems);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);

    newItems.forEach((item) => {
      setDoc(doc(db, 'notifications', item.id), item).catch(() => {});
    });

    return newItems.length;
  },

  // --- PROFILES & USERS ---
  async getProfiles(): Promise<Profile[]> {
    return profiles;
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    profiles[idx] = { ...profiles[idx], ...updates, updated_at: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.PROFILES, profiles);
    const curr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (curr) {
      const parsed = JSON.parse(curr);
      if (parsed.id === id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profiles[idx]));
        window.dispatchEvent(new CustomEvent('egspec_auth_state_change', { detail: profiles[idx] }));
      }
    }
    return profiles[idx];
  },

  // --- PAYMENTS & GATEWAY TRANSACTIONS ---
  async createPayment(payment: Omit<PaymentTransaction, 'id' | 'created_at'>): Promise<PaymentTransaction> {
    const newTxn: PaymentTransaction = {
      ...payment,
      id: 'pay-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    payments.unshift(newTxn);
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
    // Persist to Firestore
    setDoc(doc(db, 'payments', newTxn.id), newTxn).catch((err) =>
      console.warn('Firestore payment save notice:', err)
    );
    return newTxn;
  },

  async getPayments(studentId?: string): Promise<PaymentTransaction[]> {
    if (studentId) {
      return payments.filter((p) => p.student_id === studentId);
    }
    return payments;
  },

  async getPaymentByRegistrationId(regId: string): Promise<PaymentTransaction | null> {
    return payments.find((p) => p.registration_id === regId) || null;
  },

  // --- ADMIN STATS ---
  async getAdminStats() {
    const totalStudents = profiles.filter((p) => p.role === 'student').length;
    const totalOrganizers = profiles.filter((p) => p.role === 'organizer').length;
    const totalEvents = events.length;
    const pendingApprovals = events.filter((e) => e.status === 'pending').length;
    const totalRegistrations = registrations.filter((r) => r.status === 'confirmed').length;
    const upcomingEvents = events.filter((e) => e.status === 'approved' && new Date(e.date) >= new Date()).length;

    // Events by Category
    const categoryCounts: Record<string, number> = {};
    categories.forEach((c) => { categoryCounts[c.name] = 0; });
    events.forEach((e) => {
      const cat = categories.find((c) => c.id === e.category_id);
      if (cat) categoryCounts[cat.name] = (categoryCounts[cat.name] || 0) + 1;
    });
    const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

    // Department participation
    const deptCounts: Record<string, number> = {
      'CSE': 184,
      'ECE': 120,
      'IT': 95,
      'EEE': 72,
      'MECH': 68,
      'AI & DS': 88,
      'CIVIL': 45,
      'MBA/MCA': 55
    };

    return {
      totalStudents,
      totalOrganizers,
      totalEvents,
      pendingApprovals,
      totalRegistrations,
      upcomingEvents,
      categoryChartData,
      departmentParticipation: Object.entries(deptCounts).map(([dept, count]) => ({ dept, count })),
      monthlyRegistrations: [
        { month: 'Jun', count: 42 },
        { month: 'Jul', count: 78 },
        { month: 'Aug', count: 145 },
        { month: 'Sep', count: 210 },
        { month: 'Oct', count: 320 },
      ],
      attendanceRate: [
        { name: 'Attended', value: attendance.length + 180 },
        { name: 'Absent / Pending', value: Math.max(15, registrations.length * 3 - attendance.length) }
      ]
    };
  }
};
