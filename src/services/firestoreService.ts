import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
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
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_CATEGORIES,
  INITIAL_VENUES,
  INITIAL_EVENTS,
  INITIAL_SCHEDULES,
  INITIAL_REGISTRATIONS,
  INITIAL_ATTENDANCE,
  INITIAL_NOTIFICATIONS,
} from './mockData';

// Flag to ensure auto-seeding only runs once per session
let hasSeeded = false;

export async function seedFirestoreIfEmpty() {
  if (hasSeeded) return;
  hasSeeded = true;

  try {
    const eventsSnap = await getDocs(collection(db, 'events'));
    if (!eventsSnap.empty) {
      console.log('Firestore already contains data. Skipping initial seeding.');
      return;
    }

    console.log('Seeding initial college data to Firestore...');
    const batch = writeBatch(db);

    // Seed Categories
    INITIAL_CATEGORIES.forEach((cat) => {
      batch.set(doc(db, 'categories', cat.id), cat);
    });

    // Seed Venues
    INITIAL_VENUES.forEach((v) => {
      batch.set(doc(db, 'venues', v.id), v);
    });

    // Seed Events
    INITIAL_EVENTS.forEach((e) => {
      batch.set(doc(db, 'events', e.id), e);
    });

    // Seed Schedules
    INITIAL_SCHEDULES.forEach((s) => {
      batch.set(doc(db, 'schedules', s.id), s);
    });

    // Seed Profiles
    INITIAL_PROFILES.forEach((p) => {
      batch.set(doc(db, 'profiles', p.id), p);
    });

    // Seed Registrations
    INITIAL_REGISTRATIONS.forEach((r) => {
      batch.set(doc(db, 'registrations', r.id), r);
    });

    // Seed Attendance
    INITIAL_ATTENDANCE.forEach((a) => {
      batch.set(doc(db, 'attendance', a.id), a);
    });

    // Seed Notifications
    INITIAL_NOTIFICATIONS.forEach((n) => {
      batch.set(doc(db, 'notifications', n.id), n);
    });

    await batch.commit();
    console.log('Successfully seeded initial college catalog to Firestore.');
  } catch (err) {
    console.warn('Initial seeding skipped or restricted by Firestore rules:', err);
  }
}

// Automatically initiate seeding on module load
seedFirestoreIfEmpty();

export const firestoreApi = {
  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    const path = 'categories';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) return INITIAL_CATEGORIES;
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Category));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return INITIAL_CATEGORIES;
    }
  },

  async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const path = 'categories';
    try {
      const newId = `cat-${Date.now()}`;
      const newCategory: Category = { ...cat, id: newId };
      await setDoc(doc(db, path, newId), newCategory);
      return newCategory;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      throw err;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      return false;
    }
  },

  // VENUES
  async getVenues(): Promise<Venue[]> {
    const path = 'venues';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) return INITIAL_VENUES;
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Venue));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return INITIAL_VENUES;
    }
  },

  async createVenue(v: Omit<Venue, 'id'>): Promise<Venue> {
    const path = 'venues';
    try {
      const newId = `ven-${Date.now()}`;
      const newVenue: Venue = { ...v, id: newId };
      await setDoc(doc(db, path, newId), newVenue);
      return newVenue;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      throw err;
    }
  },

  async deleteVenue(id: string): Promise<boolean> {
    const path = `venues/${id}`;
    try {
      await deleteDoc(doc(db, 'venues', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      return false;
    }
  },

  // EVENTS
  async getEvents(options?: {
    status?: string;
    category?: string;
    department?: string;
    venue?: string;
    price?: 'all' | 'free' | 'paid';
    organizerId?: string;
    search?: string;
    sortBy?: 'upcoming' | 'newest' | 'popular';
  }): Promise<CollegeEvent[]> {
    const path = 'events';
    try {
      const [eventsSnap, categories, venues, profiles] = await Promise.all([
        getDocs(collection(db, path)),
        this.getCategories(),
        this.getVenues(),
        this.getProfiles(),
      ]);

      const events: CollegeEvent[] = eventsSnap.empty
        ? INITIAL_EVENTS
        : (eventsSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as CollegeEvent[]);

      let result = events.map((e) => ({
        ...e,
        category: categories.find((c) => c.id === e.category_id),
        venue: venues.find((v) => v.id === e.venue_id),
        organizer: profiles.find((p) => p.id === e.organizer_id),
      }));

      if (options?.status) {
        result = result.filter((e) => e.status === options.status);
      }
      if (options?.category && options.category !== 'all') {
        const catFilter = options.category.toLowerCase();
        result = result.filter(
          (e) =>
            e.category_id === options.category ||
            e.category?.name.toLowerCase() === catFilter
        );
      }
      if (options?.department && options.department !== 'all') {
        const deptFilter = options.department.toLowerCase();
        result = result.filter((e) => e.department.toLowerCase() === deptFilter);
      }
      if (options?.venue && options.venue !== 'all') {
        const venFilter = options.venue.toLowerCase();
        result = result.filter(
          (e) =>
            e.venue_id === options.venue ||
            (e.venue?.name && e.venue.name.toLowerCase().includes(venFilter))
        );
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
            e.department.toLowerCase().includes(q)
        );
      }

      if (options?.sortBy === 'newest') {
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (options?.sortBy === 'popular') {
        result.sort((a, b) => (b.registered_count || 0) - (a.registered_count || 0));
      } else {
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }

      return result;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return INITIAL_EVENTS;
    }
  },

  async getEventById(id: string): Promise<CollegeEvent | null> {
    const path = `events/${id}`;
    try {
      const snap = await getDoc(doc(db, 'events', id));
      if (!snap.exists()) return null;
      const data = { ...snap.data(), id: snap.id } as CollegeEvent;

      const [categories, venues, profiles] = await Promise.all([
        this.getCategories(),
        this.getVenues(),
        this.getProfiles(),
      ]);

      return {
        ...data,
        category: categories.find((c) => c.id === data.category_id),
        venue: venues.find((v) => v.id === data.venue_id),
        organizer: profiles.find((p) => p.id === data.organizer_id),
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  },

  async createEvent(event: Omit<CollegeEvent, 'id' | 'created_at' | 'registered_count'>): Promise<CollegeEvent> {
    const path = 'events';
    try {
      const newId = `evt-${Date.now()}`;
      const newEvent: CollegeEvent = {
        ...event,
        id: newId,
        registered_count: 0,
        created_at: new Date().toISOString(),
      };
      await setDoc(doc(db, path, newId), newEvent);
      return newEvent;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      throw err;
    }
  },

  async updateEvent(id: string, updates: Partial<CollegeEvent>): Promise<CollegeEvent | null> {
    const path = `events/${id}`;
    try {
      await updateDoc(doc(db, 'events', id), updates);
      return await this.getEventById(id);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return null;
    }
  },

  async deleteEvent(id: string): Promise<boolean> {
    const path = `events/${id}`;
    try {
      await deleteDoc(doc(db, 'events', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      return false;
    }
  },

  async updateEventStatus(
    id: string,
    status: CollegeEvent['status'],
    reasonOrNote?: string
  ): Promise<CollegeEvent | null> {
    const updated = await this.updateEvent(id, { status });
    if (!updated) return null;

    try {
      const now = new Date().toISOString();
      const notifOrg: NotificationItem = {
        id: `notif-${Date.now()}-org`,
        recipient_id: updated.organizer_id,
        title: `Event Status: ${status.toUpperCase()}`,
        message: `Your event "${updated.title}" status changed to ${status.toUpperCase()}. ${reasonOrNote || ''}`,
        type: 'event',
        is_read: false,
        created_at: now,
        link: `/events/${updated.id}`,
        action_label: 'View Event',
        metadata: {
          eventId: updated.id,
          eventTitle: updated.title,
          status,
        },
      };
      await setDoc(doc(db, 'notifications', notifOrg.id), notifOrg);

      if (status === 'cancelled' || status === 'completed') {
        const regs = await this.getEventRegistrations(id);
        const batch = writeBatch(db);
        regs.forEach((r, idx) => {
          const notifId = `notif-${Date.now()}-reg-${idx}`;
          const item: NotificationItem = {
            id: notifId,
            recipient_id: r.student_id,
            title: status === 'cancelled' ? `⚠️ Event Cancelled: ${updated.title}` : `✓ Event Concluded: ${updated.title}`,
            message: status === 'cancelled'
              ? `Important Notice: "${updated.title}" scheduled for ${updated.date} has been cancelled. Any fees will be refunded.`
              : `Event "${updated.title}" has concluded. Thank you for participating!`,
            type: 'event',
            is_read: false,
            created_at: now,
            link: `/events/${updated.id}`,
            action_label: 'View Event',
            metadata: {
              eventId: updated.id,
              registrationId: r.registration_id,
              eventTitle: updated.title,
              status,
            },
          };
          batch.set(doc(db, 'notifications', notifId), item);
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn('Firestore status notifications notice:', e);
    }

    return updated;
  },

  // SCHEDULES
  async getSchedules(eventId: string): Promise<EventSchedule[]> {
    const path = 'schedules';
    try {
      const snap = await getDocs(collection(db, path));
      const all = snap.empty
        ? INITIAL_SCHEDULES
        : (snap.docs.map((d) => ({ ...d.data(), id: d.id })) as EventSchedule[]);
      return all.filter((s) => s.event_id === eventId);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return INITIAL_SCHEDULES.filter((s) => s.event_id === eventId);
    }
  },

  async createSchedule(slot: Omit<EventSchedule, 'id'>): Promise<EventSchedule> {
    const path = 'schedules';
    try {
      const newId = `sch-${Date.now()}`;
      const newSlot: EventSchedule = { ...slot, id: newId };
      await setDoc(doc(db, path, newId), newSlot);
      return newSlot;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      throw err;
    }
  },

  // REGISTRATIONS
  async getMyRegistrations(studentId: string): Promise<Registration[]> {
    const path = 'registrations';
    try {
      const [regSnap, events, profiles] = await Promise.all([
        getDocs(collection(db, path)),
        this.getEvents(),
        this.getProfiles(),
      ]);

      const regs: Registration[] = regSnap.empty
        ? INITIAL_REGISTRATIONS
        : (regSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as Registration[]);

      return regs
        .filter((r) => r.student_id === studentId)
        .map((r) => ({
          ...r,
          event: events.find((e) => e.id === r.event_id),
          student: profiles.find((p) => p.id === r.student_id),
        }));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  async getEventRegistrations(eventId: string): Promise<Registration[]> {
    const path = 'registrations';
    try {
      const [regSnap, event, profiles] = await Promise.all([
        getDocs(collection(db, path)),
        this.getEventById(eventId),
        this.getProfiles(),
      ]);

      const regs: Registration[] = regSnap.empty
        ? INITIAL_REGISTRATIONS
        : (regSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as Registration[]);

      return regs
        .filter((r) => r.event_id === eventId)
        .map((r) => ({
          ...r,
          event: event || undefined,
          student: profiles.find((p) => p.id === r.student_id),
        }));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  async getAllRegistrations(): Promise<Registration[]> {
    const path = 'registrations';
    try {
      const [regSnap, events, profiles] = await Promise.all([
        getDocs(collection(db, path)),
        this.getEvents(),
        this.getProfiles(),
      ]);

      const regs: Registration[] = regSnap.empty
        ? INITIAL_REGISTRATIONS
        : (regSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as Registration[]);

      return regs.map((r) => ({
        ...r,
        event: events.find((e) => e.id === r.event_id),
        student: profiles.find((p) => p.id === r.student_id),
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  async registerForEvent(
    eventId: string,
    studentId: string
  ): Promise<{ success: boolean; registration?: Registration; error?: string }> {
    const path = 'registrations';
    try {
      const event = await this.getEventById(eventId);
      if (!event) return { success: false, error: 'Event not found' };
      if (Number(event.registered_count || 0) >= Number(event.max_participants || 100)) {
        return { success: false, error: 'Event is at full capacity' };
      }

      const existingRegs = await this.getMyRegistrations(studentId);
      const already = existingRegs.find(
        (r) => r.event_id === eventId && r.status === 'confirmed'
      );
      if (already) {
        return { success: false, error: 'You are already registered for this event' };
      }

      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const registrationCode = `EVT-2026-${randomDigits}`;
      const newId = `reg-${Date.now()}`;

      const newReg: Registration = {
        id: newId,
        event_id: eventId,
        student_id: studentId,
        registration_id: registrationCode,
        status: 'confirmed',
        payment_status: Number(event.registration_fee) > 0 ? 'paid' : 'free',
        registered_at: new Date().toISOString(),
      };

      await setDoc(doc(db, path, newId), newReg);

      // Increment registered count on event
      await updateDoc(doc(db, 'events', eventId), {
        registered_count: (event.registered_count || 0) + 1,
      });

      // Send confirmation notification
      await this.sendNotification(
        studentId,
        'Event Registration Confirmed!',
        `Your seat for "${event.title}" is confirmed. Your Admission Pass ID is ${registrationCode}.`,
        'registration'
      );

      const student = (await this.getProfiles()).find((p) => p.id === studentId);

      return {
        success: true,
        registration: {
          ...newReg,
          event,
          student,
        },
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return { success: false, error: 'Registration failed due to a database error' };
    }
  },

  async cancelRegistration(regId: string): Promise<boolean> {
    const path = `registrations/${regId}`;
    try {
      const snap = await getDoc(doc(db, 'registrations', regId));
      if (!snap.exists()) return false;
      const reg = snap.data() as Registration;

      await updateDoc(doc(db, 'registrations', regId), { status: 'cancelled' });

      // Decrement event count
      const eventSnap = await getDoc(doc(db, 'events', reg.event_id));
      if (eventSnap.exists()) {
        const ev = eventSnap.data() as CollegeEvent;
        await updateDoc(doc(db, 'events', reg.event_id), {
          registered_count: Math.max(0, (ev.registered_count || 1) - 1),
        });
      }
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return false;
    }
  },

  // QR VERIFICATION
  async verifyTicketQR(
    registrationId: string,
    eventId?: string,
    _staffId: string = 'staff-001'
  ): Promise<QRVerificationResult> {
    try {
      const allRegs = await this.getAllRegistrations();
      const reg = allRegs.find((r) => r.registration_id === registrationId);

      if (!reg) {
        return {
          valid: false,
          message: 'Invalid Ticket: Registration ID not found in portal database.',
        };
      }

      if (reg.status === 'cancelled') {
        return {
          valid: false,
          message: 'Registration was cancelled. Admission denied.',
          registration: reg,
        };
      }

      if (eventId && reg.event_id !== eventId) {
        return {
          valid: false,
          message: `Ticket is for another event: "${reg.event?.title}".`,
          registration: reg,
        };
      }

      // Check if already checked in
      const attSnap = await getDocs(collection(db, 'attendance'));
      const attendanceList = attSnap.empty
        ? INITIAL_ATTENDANCE
        : (attSnap.docs.map((d) => d.data()) as Attendance[]);

      const alreadyCheckedIn = attendanceList.some(
        (a) => a.registration_id === registrationId
      );

      if (alreadyCheckedIn) {
        return {
          valid: false,
          message: 'Notice: Ticket was already scanned previously.',
          registration: reg,
        };
      }

      // Log attendance in Firestore
      const newAttId = `att-${Date.now()}`;
      const checkInTime = new Date().toISOString();
      const newAttRecord: Attendance = {
        id: newAttId,
        event_id: reg.event_id,
        registration_id: registrationId,
        student_id: reg.student_id,
        check_in_time: checkInTime,
        status: 'present',
      };

      await setDoc(doc(db, 'attendance', newAttId), newAttRecord);

      return {
        valid: true,
        message: 'Admission Verified Successfully! Welcome to EGSPEC Event.',
        registration: reg,
        event: reg.event,
        student: reg.student,
        checkInTime,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'attendance');
      return {
        valid: false,
        message: 'System error during verification.',
      };
    }
  },

  async getAttendanceList(eventId: string): Promise<Attendance[]> {
    const path = 'attendance';
    try {
      const [attSnap, profiles] = await Promise.all([
        getDocs(collection(db, path)),
        this.getProfiles(),
      ]);

      const atts: Attendance[] = attSnap.empty
        ? INITIAL_ATTENDANCE
        : (attSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as Attendance[]);

      return atts
        .filter((a) => a.event_id === eventId)
        .map((a) => ({
          ...a,
          student: profiles.find((p) => p.id === a.student_id),
        }));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  // NOTIFICATIONS
  async getNotifications(recipientId: string): Promise<NotificationItem[]> {
    const path = 'notifications';
    try {
      const snap = await getDocs(collection(db, path));
      const all: NotificationItem[] = snap.empty
        ? INITIAL_NOTIFICATIONS
        : (snap.docs.map((d) => ({ ...d.data(), id: d.id })) as NotificationItem[]);

      return all.filter((n) => n.recipient_id === recipientId || n.recipient_id === 'all');
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  async sendNotification(
    recipientId: string,
    title: string,
    message: string,
    type: NotificationItem['type'] = 'system'
  ): Promise<NotificationItem> {
    const path = 'notifications';
    try {
      const newId = `notif-${Date.now()}`;
      const item: NotificationItem = {
        id: newId,
        recipient_id: recipientId,
        title,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      await setDoc(doc(db, path, newId), item);
      return item;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      throw err;
    }
  },

  async sendBroadcastNotification(
    title: string,
    message: string,
    type: NotificationItem['type'] = 'announcement',
    targetRole?: 'all' | 'student' | 'organizer'
  ): Promise<number> {
    const path = 'notifications';
    try {
      const profiles = await this.getProfiles();
      let targets = profiles;
      if (targetRole && targetRole !== 'all') {
        targets = targets.filter((p) => p.role === targetRole);
      }

      const batch = writeBatch(db);
      const now = new Date().toISOString();
      targets.forEach((t, idx) => {
        const newId = `notif-${Date.now()}-${idx}`;
        const item: NotificationItem = {
          id: newId,
          recipient_id: t.id,
          title,
          message,
          type,
          is_read: false,
          created_at: now,
        };
        batch.set(doc(db, path, newId), item);
      });

      await batch.commit();
      return targets.length;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return 0;
    }
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const path = `notifications/${id}`;
    try {
      await updateDoc(doc(db, 'notifications', id), { is_read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  async markAllNotificationsAsRead(recipientId: string): Promise<void> {
    const path = 'notifications';
    try {
      const snap = await getDocs(collection(db, path));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.recipient_id === recipientId || data.recipient_id === 'all') {
          batch.update(d.ref, { is_read: true });
        }
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // PROFILES
  async getProfiles(): Promise<Profile[]> {
    const path = 'profiles';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) return INITIAL_PROFILES;
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Profile));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return INITIAL_PROFILES;
    }
  },

  async updateProfileRole(userId: string, role: Profile['role']): Promise<Profile | null> {
    const path = `profiles/${userId}`;
    try {
      await updateDoc(doc(db, 'profiles', userId), { role });
      const snap = await getDoc(doc(db, 'profiles', userId));
      return snap.exists() ? ({ ...snap.data(), id: snap.id } as Profile) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const path = `profiles/${userId}`;
    try {
      await updateDoc(doc(db, 'profiles', userId), updates);
      const snap = await getDoc(doc(db, 'profiles', userId));
      return snap.exists() ? ({ ...snap.data(), id: snap.id } as Profile) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return null;
    }
  },

  // PAYMENTS & TRANSACTIONS
  async createPayment(payment: Omit<PaymentTransaction, 'id' | 'created_at'>): Promise<PaymentTransaction> {
    const path = 'payments';
    try {
      const newId = `pay-${Date.now()}`;
      const newTxn: PaymentTransaction = {
        ...payment,
        id: newId,
        created_at: new Date().toISOString(),
      };
      await setDoc(doc(db, path, newId), newTxn);

      // Also update the registration record in Firestore
      try {
        await updateDoc(doc(db, 'registrations', payment.registration_id), {
          payment_status: 'paid',
          amount_paid: payment.amount,
          payment_method: payment.payment_method_detail || payment.payment_method,
          transaction_ref: payment.transaction_ref,
        });
      } catch (err) {
        console.warn('Registration payment update notice:', err);
      }

      return newTxn;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      throw err;
    }
  },

  async getPayments(studentId?: string): Promise<PaymentTransaction[]> {
    const path = 'payments';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) return [];
      const all = snap.docs.map((d) => ({ ...d.data(), id: d.id } as PaymentTransaction));
      return studentId ? all.filter((p) => p.student_id === studentId) : all;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  async getPaymentByRegistrationId(regId: string): Promise<PaymentTransaction | null> {
    const path = 'payments';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) return null;
      const found = snap.docs
        .map((d) => ({ ...d.data(), id: d.id } as PaymentTransaction))
        .find((p) => p.registration_id === regId);
      return found || null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  },
};
