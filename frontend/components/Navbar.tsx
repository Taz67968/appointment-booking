'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) return null;

  const profileSrc = user?.profile_image
    ? user.profile_image.startsWith('http')
      ? user.profile_image
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}${user.profile_image}`
    : null;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                AppointmentHub
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div ref={ref} className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center space-x-3 focus:outline-none"
                aria-expanded={open}
                aria-haspopup="menu"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                {profileSrc ? (
                  <img src={profileSrc} alt={`${user?.first_name} ${user?.last_name}`} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  {user?.role === 'provider' && (
                    <Link href="/profile/edit" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Edit Profile
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

