-- ==============================================================================
-- E.G.S. PILLAY ENGINEERING COLLEGE - EVENT MANAGEMENT PORTAL
-- PostgreSQL Database Schema for Supabase
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked with Supabase Auth users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  register_number TEXT UNIQUE,
  department TEXT NOT NULL,
  year TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'organizer', 'admin')) DEFAULT 'student',
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_register_number ON public.profiles(register_number);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. VENUES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  description TEXT,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. EVENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  poster_url TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE RESTRICT,
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  eligibility TEXT DEFAULT 'Open to all departments',
  max_participants INTEGER NOT NULL DEFAULT 100,
  registration_fee NUMERIC(10, 2) DEFAULT 0.00,
  registration_deadline TIMESTAMPTZ NOT NULL,
  rules TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_venue ON public.events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);

-- ------------------------------------------------------------------------------
-- 5. EVENT SCHEDULES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  schedule_time TIME NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_schedules_event_id ON public.event_schedules(event_id);

-- ------------------------------------------------------------------------------
-- 6. REGISTRATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id TEXT NOT NULL UNIQUE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'attended')) DEFAULT 'confirmed',
  payment_status TEXT NOT NULL CHECK (payment_status IN ('free', 'pending', 'paid', 'failed')) DEFAULT 'free',
  CONSTRAINT unique_student_event_registration UNIQUE (event_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student ON public.registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);

-- ------------------------------------------------------------------------------
-- 7. ATTENDANCE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')) DEFAULT 'present',
  CONSTRAINT unique_registration_attendance UNIQUE (registration_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);

-- ------------------------------------------------------------------------------
-- 8. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('event', 'registration', 'reminder', 'announcement', 'system')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Is Organizer
CREATE OR REPLACE FUNCTION public.is_organizer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'organizer' OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Categories Policies
CREATE POLICY "Categories are readable by everyone"
  ON public.categories FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admin can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Venues Policies
CREATE POLICY "Venues are readable by everyone"
  ON public.venues FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admin can manage venues"
  ON public.venues FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Events Policies
CREATE POLICY "Approved events are viewable by everyone"
  ON public.events FOR SELECT
  TO authenticated, anon
  USING (status = 'approved' OR public.is_admin() OR organizer_id = auth.uid());

CREATE POLICY "Organizers and admins can insert events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_organizer() AND (organizer_id = auth.uid() OR public.is_admin()));

CREATE POLICY "Organizers can update their own events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Organizers and admins can delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (organizer_id = auth.uid() OR public.is_admin());

-- Event Schedules Policies
CREATE POLICY "Event schedules are viewable by everyone"
  ON public.event_schedules FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Organizers can manage schedules for their events"
  ON public.event_schedules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_schedules.event_id
      AND (events.organizer_id = auth.uid() OR public.is_admin())
    )
  );

-- Registrations Policies
CREATE POLICY "Students can view their own registrations"
  ON public.registrations FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = registrations.event_id AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Students can register for approved events"
  ON public.registrations FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can cancel their own registrations"
  ON public.registrations FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() OR public.is_admin());

-- Attendance Policies
CREATE POLICY "Organizers and admins can view attendance"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = attendance.event_id AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can record attendance"
  ON public.attendance FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = attendance.event_id AND events.organizer_id = auth.uid()
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notification read status"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Organizers and admins can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_organizer());

-- ------------------------------------------------------------------------------
-- 10. REALTIME CONFIGURATION
-- ------------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
