-- ==============================================================================
-- E.G.S. PILLAY ENGINEERING COLLEGE - EVENT MANAGEMENT PORTAL
-- Seed Data for Supabase PostgreSQL Database
-- ==============================================================================

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name, description, icon, status) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Technical', 'Technical symposiums, project expos, coding hackathons & innovation challenges', 'Cpu', true),
  ('c1000000-0000-0000-0000-000000000002', 'Cultural', 'Annual cultural fests, music, classical dance, drama, choreography & talent contests', 'Music', true),
  ('c1000000-0000-0000-0000-000000000003', 'Sports', 'Inter-department cricket, football, volleyball, athletics & badminton meets', 'Trophy', true),
  ('c1000000-0000-0000-0000-000000000004', 'Workshop', 'Hands-on technical bootcamps, hardware prototyping & skill-building masterclasses', 'Wrench', true),
  ('c1000000-0000-0000-0000-000000000005', 'Seminar', 'Guest lectures, industry keynotes, research talks and academic research forums', 'BookOpen', true),
  ('c1000000-0000-0000-0000-000000000006', 'Competition', 'Paper presentations, design sprints, quiz bowls & competitive gaming tournaments', 'Target', true),
  ('c1000000-0000-0000-0000-000000000007', 'Hackathon', '24-hour and 36-hour sprint coding, AI solution development & smart campus hackathons', 'Code2', true),
  ('c1000000-0000-0000-0000-000000000008', 'Placement', 'Campus drive preparation, mock interviews, aptitude masterclasses & HR interactions', 'Briefcase', true),
  ('c1000000-0000-0000-0000-000000000009', 'Others', 'Social outreach, NSS/YRC community camps, photography exhibitions & club meetups', 'Sparkles', true)
ON CONFLICT (name) DO NOTHING;

-- 2. SEED VENUES
INSERT INTO public.venues (id, name, location, capacity, description, status) VALUES
  ('v1000000-0000-0000-0000-000000000001', 'CSE Seminar Hall', 'Ground Floor, Computer Science Block', 180, 'Air-conditioned hall equipped with dual 4K laser projectors, stage audio system and high-speed Wi-Fi', true),
  ('v1000000-0000-0000-0000-000000000002', 'College Auditorium', 'Main Campus Central Complex', 1200, 'State-of-the-art acoustic auditorium with motorized stage lighting, green rooms and mezzanine seating', true),
  ('v1000000-0000-0000-0000-000000000003', 'College Ground', 'Sports Complex, East Wing', 2500, 'Floodlit outdoor sports field with running tracks, cricket pitch, football turf and pavilion', true),
  ('v1000000-0000-0000-0000-000000000004', 'EEE Lab & Prototyping Center', 'Second Floor, Electrical Sciences Block', 80, 'Specialized hardware lab with digital oscilloscopes, soldering stations and IoT breadboards', true),
  ('v1000000-0000-0000-0000-000000000005', 'Conference Hall', 'Administrative Block, Level 1', 120, 'Executive round-table conference hall with video conferencing endpoints and interactive smartboard', true),
  ('v1000000-0000-0000-0000-000000000006', 'Main Block Amphitheater', 'Central Courtyard', 600, 'Open-air stepped amphitheater for cultural gatherings, street plays and evening celebrations', true),
  ('v1000000-0000-0000-0000-000000000007', 'T&P Hall (Training & Placement)', 'Placement Cell, North Block', 250, 'Tiered seminar hall with dedicated individual testing terminals and interview cubicles', true),
  ('v1000000-0000-0000-0000-000000000008', 'Library Block Digital Center', 'Central Library, 2nd Floor', 150, 'Silent computing center with 120 connected workstations and research repository access', true)
ON CONFLICT (name) DO NOTHING;

-- 3. SEED PROFILES (Mock user profiles for development / demo)
INSERT INTO public.profiles (id, name, email, register_number, department, year, phone, role, profile_image) VALUES
  ('u1000000-0000-0000-0000-000000000001', 'Vishwa S.', 'vishwaegs@gmail.com', '820822104055', 'CSE', '3rd Year', '+91 98401 23456', 'student', ''),
  ('u1000000-0000-0000-0000-000000000002', 'Dr. K. Ramanathan', 'ramanathan.cse@egspec.org', 'STAFF-CSE-102', 'CSE', 'Faculty', '+91 94432 87654', 'organizer', ''),
  ('u1000000-0000-0000-0000-000000000003', 'Prof. S. Balasubramanian', 'dean.events@egspec.org', 'ADMIN-EGSPC-01', 'Dean Office', 'Dean', '+91 94421 11223', 'admin', ''),
  ('u1000000-0000-0000-0000-000000000004', 'Ananya Ramesh', 'ananya.ece@egspec.org', '820822106012', 'ECE', '4th Year', '+91 97890 54321', 'student', ''),
  ('u1000000-0000-0000-0000-000000000005', 'Prof. M. Vijayalakshmi', 'sports.director@egspec.org', 'STAFF-PED-04', 'Physical Education', 'Director', '+91 94433 99887', 'organizer', '')
ON CONFLICT (email) DO NOTHING;

-- 4. SEED SAMPLE EVENTS
INSERT INTO public.events (
  id, title, description, category_id, poster_url, date, start_time, end_time,
  venue_id, organizer_id, department, eligibility, max_participants, registration_fee,
  registration_deadline, rules, status
) VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  'Web Development & Modern React Workshop',
  'Intensive hands-on masterclass focusing on building reactive, accessible, high-performance web applications using modern JavaScript, React 19, Tailwind CSS, and cloud backends. Participants will build a full-stack real-time college portal component from scratch.',
  'c1000000-0000-0000-0000-000000000004',
  '/assets/events/webdev.svg',
  '2026-10-15',
  '09:30:00',
  '16:30:00',
  'v1000000-0000-0000-0000-000000000001',
  'u1000000-0000-0000-0000-000000000002',
  'CSE',
  'All 2nd, 3rd & 4th Year Engineering students',
  120,
  0.00,
  '2026-10-14 18:00:00+00',
  '1. Bring your personal laptop with Node.js 20+ and VS Code installed. 2. Active internet access will be provided via campus Wi-Fi. 3. Certificate of participation will be provided upon verified check-in.',
  'approved'
),
(
  'e1000000-0000-0000-0000-000000000002',
  'HackEGSPC 2026 — 24-Hour Campus Hackathon',
  'The flagship 24-hour innovation hackathon of E.G.S. Pillay Engineering College! Build groundbreaking software and hardware prototypes addressing Smart Education, Rural Healthcare, Sustainable Energy, or Maritime Logistics for Coastal Tamil Nadu.',
  'c1000000-0000-0000-0000-000000000007',
  '/assets/events/hackathon.svg',
  '2026-10-24',
  '09:00:00',
  '09:00:00',
  'v1000000-0000-0000-0000-000000000008',
  'u1000000-0000-0000-0000-000000000002',
  'CSE',
  'Teams of 2 to 4 students from any department',
  200,
  150.00,
  '2026-10-22 23:59:00+00',
  '1. Code must be authored during the 24-hour hack window. 2. Pre-built libraries and open-source APIs permitted with disclosure. 3. Overnight accommodation and meals provided in college campus.',
  'approved'
),
(
  'e1000000-0000-0000-0000-000000000003',
  'Dhwani 2026 — Inter-College Cultural Fest',
  'The mega cultural extravaganza of Nagapattinam! Featuring battle of the bands, classical Bharatanatyam, western fusion choreography, RJ hunt, mime, instrumental symphony, and celebrity guest musical performance.',
  'c1000000-0000-0000-0000-000000000002',
  '/assets/events/cultural.svg',
  '2026-11-06',
  '10:00:00',
  '20:00:00',
  'v1000000-0000-0000-0000-000000000002',
  'u1000000-0000-0000-0000-000000000005',
  'Fine Arts Club',
  'Open to all university and college students with valid College ID',
  1000,
  0.00,
  '2026-11-04 18:00:00+00',
  '1. College ID card is mandatory for entry. 2. Obscene or offensive lyrics/themes strictly barred. 3. Organizers hold final say on performance schedules.',
  'approved'
),
(
  'e1000000-0000-0000-0000-000000000004',
  'E.G.S. Trophy 2026 — Inter-Department Cricket Championship',
  'Annual T10 knockout cricket tournament between departments. Compete for the prestigious Chairman Trophy, Best Batsman, Best Bowler, and Player of the Series awards on the college floodlit turf ground.',
  'c1000000-0000-0000-0000-000000000003',
  '/assets/events/sports.svg',
  '2026-10-18',
  '08:00:00',
  '18:00:00',
  'v1000000-0000-0000-0000-000000000003',
  'u1000000-0000-0000-0000-000000000005',
  'Physical Education',
  'Department team rosters validated by HODs (11 players + 4 reserves)',
  300,
  0.00,
  '2026-10-16 17:00:00+00',
  '1. Official white jersey and athletic kit required. 2. Standard ICC T10 tournament regulations apply with local ground boundaries.',
  'approved'
),
(
  'e1000000-0000-0000-0000-000000000005',
  'AI & Generative Deep Learning National Symposium',
  'Keynote addresses by researchers from IIT Madras and top AI tech founders. Dive into Transformer architectures, multi-modal LLMs, computer vision in robotics, and ethical AI deployment in industries.',
  'c1000000-0000-0000-0000-000000000005',
  '/assets/events/seminar.svg',
  '2026-10-28',
  '10:00:00',
  '15:30:00',
  'v1000000-0000-0000-0000-000000000001',
  'u1000000-0000-0000-0000-000000000002',
  'AI & DS',
  'Undergraduate & Postgraduate scholars, faculty members',
  180,
  0.00,
  '2026-10-26 18:00:00+00',
  '1. Formal dress code requested. 2. Interactive Q&A sessions at the end of each track. 3. Digital IEEE student chapter badge provided.',
  'approved'
),
(
  'e1000000-0000-0000-0000-000000000006',
  'Campus Placement Masterclass — Top Product & IT MNCs',
  'Comprehensive placement boot camp covering algorithmic coding, System Design basics, resume ATS optimization, group discussion strategies, and mock HR interview panels conducted by corporate alumni.',
  'c1000000-0000-0000-0000-000000000008',
  '/assets/events/placement.svg',
  '2026-10-30',
  '09:30:00',
  '16:00:00',
  'v1000000-0000-0000-0000-000000000007',
  'u1000000-0000-0000-0000-000000000002',
  'Training & Placement Cell',
  'Exclusively for Pre-final (3rd) and Final (4th) year students',
  220,
  0.00,
  '2026-10-29 17:00:00+00',
  '1. Bring 2 hard copies of updated resume. 2. Formal college uniform mandatory. 3. Attendance will count towards placement eligibility credits.',
  'approved'
),
(
  'e1000000-0000-0000-0000-000000000007',
  'RoboWars & Autonomous Line Follower Championship',
  'Design, wire, and deploy robotic warriors and sensor-guided autonomous bots. Compete in obstacle navigation, arena push-outs, and speed maze solving. Cash prizes and hardware development kits for top podium finishers.',
  'c1000000-0000-0000-0000-000000000006',
  '/assets/events/robotics.svg',
  '2026-11-12',
  '10:00:00',
  '17:00:00',
  'v1000000-0000-0000-0000-000000000004',
  'u1000000-0000-0000-0000-000000000002',
  'ECE',
  'Teams of up to 3 students from any engineering discipline',
  80,
  100.00,
  '2026-11-10 18:00:00+00',
  '1. Max robot weight 5 kg for battle arena. 2. Wireless radio frequency standard 2.4 GHz. 3. Safety goggles mandatory during combat matches.',
  'approved'
),
(
  'e1000000-0000-0000-0000-000000000008',
  'PixelCraft — Campus Life Photography & Short Film Expo',
  'Showcase your lens craft! Submissions invited across three categories: "Campus Architecture & Heritage", "Monsoon Moments", and "Student Spirit". Top 30 photographs will be framed and exhibited in the Central Library.',
  'c1000000-0000-0000-0000-000000000009',
  '/assets/events/photo.svg',
  '2026-11-18',
  '11:00:00',
  '16:00:00',
  'v1000000-0000-0000-0000-000000000008',
  'u1000000-0000-0000-0000-000000000005',
  'Photography Club',
  'Open to all students and staff members',
  150,
  0.00,
  '2026-11-16 23:59:00+00',
  '1. Photos must be taken inside EGS Pillay campus premises. 2. Minimal color grading permitted; AI generated or replaced backgrounds prohibited.',
  'approved'
),
(
  'e1000000-0000-0000-0000-000000000009',
  'Cloud Native DevOps & Kubernetes Masterclass (Proposed)',
  'Modern microservices orchestration with Docker, Kubernetes clusters, and automated CI/CD pipelines with GitHub Actions.',
  'c1000000-0000-0000-0000-000000000004',
  '/assets/events/cloud.svg',
  '2026-11-25',
  '10:00:00',
  '16:00:00',
  'v1000000-0000-0000-0000-000000000001',
  'u1000000-0000-0000-0000-000000000002',
  'IT',
  'Open to all students with basic Linux command experience',
  90,
  0.00,
  '2026-11-23 18:00:00+00',
  '1. Bring laptop with virtualization enabled.',
  'pending'
);

-- 5. SEED EVENT SCHEDULES
INSERT INTO public.event_schedules (event_id, schedule_time, title, description) VALUES
  ('e1000000-0000-0000-0000-000000000001', '09:30:00', 'Check-in & Kit Distribution', 'Verification of digital QR tickets and setup of local development toolchains'),
  ('e1000000-0000-0000-0000-000000000001', '10:00:00', 'Keynote & Modern Web Architecture', 'Evolution of Frontend Ecosystem: React 19, Server Components & Edge Execution'),
  ('e1000000-0000-0000-0000-000000000001', '11:15:00', 'Hands-On Coding: Component Building', 'Building responsive layouts with Tailwind CSS, accessible primitives & state hooks'),
  ('e1000000-0000-0000-0000-000000000001', '13:00:00', 'Lunch & Networking', 'Buffet lunch served at College Dining Complex'),
  ('e1000000-0000-0000-0000-000000000001', '14:00:00', 'Full-Stack Integration with Supabase', 'Authentication, PostgreSQL Row-Level Security and Realtime WebSockets'),
  ('e1000000-0000-0000-0000-000000000001', '16:00:00', 'Mini Project Showcase & Q&A', 'Deploying to cloud, code review and issuing of digital participation certificates');

-- 6. SEED SAMPLE REGISTRATIONS
INSERT INTO public.registrations (
  id, registration_id, event_id, student_id, registered_at, status, payment_status
) VALUES
(
  'r1000000-0000-0000-0000-000000000001',
  'EVT-2026-000123',
  'e1000000-0000-0000-0000-000000000001',
  'u1000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '2 days',
  'confirmed',
  'free'
),
(
  'r1000000-0000-0000-0000-000000000002',
  'EVT-2026-000124',
  'e1000000-0000-0000-0000-000000000002',
  'u1000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '1 day',
  'confirmed',
  'paid'
),
(
  'r1000000-0000-0000-0000-000000000003',
  'EVT-2026-000125',
  'e1000000-0000-0000-0000-000000000001',
  'u1000000-0000-0000-0000-000000000004',
  NOW() - INTERVAL '3 days',
  'confirmed',
  'free'
)
ON CONFLICT (registration_id) DO NOTHING;

-- 7. SEED NOTIFICATIONS
INSERT INTO public.notifications (id, recipient_id, title, message, type, is_read) VALUES
  ('n1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000001', 'Registration Confirmed!', 'You have successfully registered for Web Development & Modern React Workshop. Registration ID: EVT-2026-000123. Access your digital ticket in My Tickets.', 'registration', false),
  ('n1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000001', 'Upcoming Event: Web Dev Workshop', 'Reminder: The workshop will begin on 15 October 2026 at 09:30 AM in CSE Seminar Hall. Please bring your laptop with VS Code installed.', 'reminder', false),
  ('n1000000-0000-0000-0000-000000000003', 'u1000000-0000-0000-0000-000000000001', 'New Event Published: HackEGSPC 2026', 'Registrations are now open for the 24-Hour Campus Hackathon. Explore tracks and register your team early!', 'event', true)
ON CONFLICT DO NOTHING;
