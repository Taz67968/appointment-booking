import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Public header */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm sm:text-base">
              AppointmentHub
            </span>
          </Link>
          <nav className="flex items-center space-x-4 text-xs sm:text-sm">
            <Link
              href="/auth/login?role=client"
              className="text-gray-700 hover:text-indigo-600 font-medium"
            >
              Sign In
            </Link>
            
            <Link
              href="/auth/register?role=client"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-xs shadow-sm hover:from-indigo-700 hover:to-blue-700 transition-all"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
      {/* Hero */}
      <main className="flex-1">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 border border-indigo-100 text-xs font-medium text-indigo-700 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
              Live booking dashboard for clients and provider
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4">
              Manage every appointment
              <span className="block bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                in one simple dashboard
              </span>
          </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-xl">
              A professional booking experience for your clients, and a powerful
              scheduling tool for your team. No spreadsheets. No back-and-forth emails.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                href="/auth/register?role=client"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Get started as a client
              </Link>
              <Link
                href="/auth/register?role=provider"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white/80 text-indigo-700 font-semibold border border-indigo-100 hover:border-indigo-300 hover:bg-white shadow-sm hover:shadow-md transition-all"
              >
                I&apos;m a provider
              </Link>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-200 border-2 border-slate-50 flex items-center justify-center text-indigo-800 text-xs font-semibold">
                  C
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-slate-50 flex items-center justify-center text-blue-800 text-xs font-semibold">
                  P
                </div>
              </div>
              <p>
                Trusted by clients and providers with real-time availability, secure
                login, and instant confirmations.
              </p>
            </div>
          </div>

          {/* Right hero card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-200/60 via-blue-100/40 to-transparent blur-3xl -z-10" />
            <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Today&apos;s overview
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Your schedule</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                  ● Online
                </span>
              </div>

              <div className="grid gap-4 mb-6 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-gray-500 mb-1">Today</p>
                  <p className="text-2xl font-bold text-gray-900">6</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Confirmed bookings
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-gray-500 mb-1">This week</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-xs text-indigo-600 font-medium mt-1">
                    Upcoming slots
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-gray-500 mb-1">Cancellation rate</p>
                  <p className="text-2xl font-bold text-gray-900">3%</p>
                  <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  {
                    name: 'Client • Sarah M.',
                    desc: 'Consultation with Dr. Adams',
                    time: 'Today • 10:00 - 10:30',
                    color: 'border-l-4 border-indigo-500',
                  },
                  {
                    name: 'Client • David K.',
                    desc: 'Follow-up session',
                    time: 'Today • 14:00 - 14:45',
                    color: 'border-l-4 border-emerald-500',
                  },
                  {
                    name: 'Client • New booking',
                    desc: 'Pending confirmation',
                    time: 'Tomorrow • 09:00 - 09:30',
                    color: 'border-l-4 border-amber-500',
                  },
                ].map((item) => (
                  <div
                    key={item.time}
                    className={`${item.color} rounded-2xl bg-slate-50 px-4 py-3 flex items-center justify-between`}
                  >
                    <div>
                      <p className="text-xs font-medium text-gray-500">{item.name}</p>
                      <p className="text-sm font-semibold text-gray-900">{item.desc}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                    </div>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-white border border-slate-200 text-gray-500">
                      View
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Real-time availability synced with your dashboard</span>
                <span className="font-medium text-indigo-600">Open dashboard →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
              How AppointmentHub works
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Book in three simple steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-start">
              <div className="flex items-center mb-3">
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold mr-3">
                  1
                </span>
                <p className="text-sm font-semibold text-gray-900">Create your account</p>
              </div>
              <p className="text-sm text-gray-600">
                Sign up as a client or provider in under a minute. Your secure dashboard is
                ready immediately.
              </p>
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center mb-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mr-3">
                  2
                </span>
                <p className="text-sm font-semibold text-gray-900">Set times or search</p>
              </div>
              <p className="text-sm text-gray-600">
                Providers publish their available slots. Clients browse by provider and pick the
                time that works.
              </p>
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center mb-3">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold mr-3">
                  3
                </span>
                <p className="text-sm font-semibold text-gray-900">Confirm and manage</p>
              </div>
              <p className="text-sm text-gray-600">
                Bookings are confirmed instantly. Both sides can review upcoming sessions and
                manage cancellations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb  -4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart scheduling</h3>
            <p className="text-sm text-gray-600">
              Providers create weekly time slots, clients book in a few clicks, and your
              calendar updates instantly
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear visibility</h3>
            <p className="text-sm text-gray-600">
              Clients see only available slots. Providers see booked, cancelled, and
              upcoming sessions in one place=
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 11h14M7 15h10M9 19h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Built-in access control</h3>
            <p className="text-sm text-gray-600">
              Separate client and provider portals, JWT-secured APIs, and role-based
              dashboards out of the box,
            </p>
          </div>
        </div>
      </section>

      {/* Why choose AppointmentHub */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-100 shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                Why teams switch to AppointmentHub
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Less admin, more meaningful sessions
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                <span>99.9% uptime</span>
              </div>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
              <span>Built for service-based businesses</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-2 text-xs font-bold">
                  1
                </span>
                Designed for real workflows
              </h3>
              <p className="text-sm text-gray-600">
                Create recurring slots once and reuse them every week. Clients only see what&apos;s
                truly available, so you never double-book.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mr-2 text-xs font-bold">
                  2
                </span>
                Clear separation of roles
              </h3>
              <p className="text-sm text-gray-600">
                Clients and providers have dedicated portals. Each sees exactly what they need:
                bookings, history, and status — nothing more
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-2 text-xs font-bold">
                  3
                </span>
                Simple, secure, and fast
              </h3>
              <p className="text-sm text-gray-600">
                JWT-based authentication, modern UI, and instant API responses so your scheduling
                feels as professional as your services
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            What people are saying
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Loved by both clients and providers
          </h2>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl mx-auto">
            From solo practitioners to small teams, AppointmentHub removes friction from every
            booking.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold mr-3">
                SM
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Sarah, Client</p>
                <p className="text-xs text-gray-500">Therapy sessions</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              &quot;Booking sessions used to mean three or four emails. Now I pick a time, click
              once, and I&apos;m done. I always know what&apos;s confirmed.&quot;
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-semibold mr-3">
                DA
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Dr. Adams</p>
                <p className="text-xs text-gray-500">Healthcare provider</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              &quot;I can see my whole week at a glance and instantly tell which slots are booked
              or free. It&apos;s exactly what I needed without being complicated&quot;
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold mr-3">
                MK
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Michael, Consultant</p>
                <p className="text-xs text-gray-500">Service provider</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              &quot;The client and provider dashboards just make sense. I spend less time managing
              bookings and more time with clients&quot;
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
              Frequently asked questions
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Answers before you get started
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is AppointmentHub free?</h3>
              <p>
                This version is designed for personal and small-team use. You can register,
                create slots, and book appointments without any subscription flow built-in.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do I need any extra tools?</h3>
              <p>
                No. Everything runs in your browser, backed by a secure API. Just log in,
                set your availability, and start booking.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Who controls the data?</h3>
              <p>
                Providers control their timeslots and see who has booked. Clients control
                their own appointments and can cancel when needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual CTA cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Link
            href="/auth/login?role=client"
            className="group block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1"
          >
            <div className="text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                For clients
              </h2>
              <p className="text-gray-600 mb-3 text-sm">
                Search providers, compare availability, and book appointments in seconds.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                View your full appointment history and cancel upcoming bookings securely.
              </p>
              <div className="inline-flex items-center text-indigo-600 font-medium group-hover:gap-2 gap-1 transition-all text-sm">
                Open client portal
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/auth/login?role=provider"
            className="group block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1"
          >
            <div className="text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                For providers
              </h2>
              <p className="text-gray-600 mb-3 text-sm">
                Publish your availability once and let clients book into your calendar
                automatically.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                See who&apos;s coming in, which slots are booked, and keep your schedule under
                control.
              </p>
              <div className="inline-flex items-center text-indigo-600 font-medium group-hover:gap-2 gap-1 transition-all text-sm">
                Open provider portal
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </section>
      </main>

      {/* Public footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-gray-500">
          <p>© {new Date().getFullYear()} AppointmentHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Secure appointment booking</span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
            <span className="hidden sm:inline-block">Built by Tazoh Cliff</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
