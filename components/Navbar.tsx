'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [homePath, setHomePath] = useState('/dashboard/teacher');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      
      if (user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabaseBrowser
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserName(profile.full_name || 'User');
          setHomePath(profile.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/admin');
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await supabaseBrowser.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-[1380px] mx-auto px-4 md:px-10">
        <div className="h-20 flex items-center justify-between">
          
          {/* LOGO + NAME */}
          <Link href={homePath} className="flex items-center">
            <img src="/images/logo.png" alt="Logo" className="h-12 md:h-14 w-auto" />
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-black ml-2">TPS EduShift Support</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-10 text-lg font-medium text-black">
            <Link href="/about" className="hover:text-blue-600 transition">ABOUT</Link>
            <Link href="/security" className="hover:text-blue-600 transition">SECURITY</Link>
            <Link href="/credits" className="hover:text-blue-600 transition">CREDITS</Link>
          </div>

          {/* ACCOUNT / LOGIN */}
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 hover:bg-gray-100 px-4 py-2 rounded-3xl transition">
                <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-lg">👤</div>
                <span className="font-medium text-black hidden sm:inline">{userName}</span>
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white rounded-3xl shadow-2xl border py-3 z-50">
                  <Link href="/dashboard/profile" className="block px-8 py-4 hover:bg-gray-100 text-black">Profile</Link>
                  <Link href="/dashboard/settings" className="block px-8 py-4 hover:bg-gray-100 text-black">Settings</Link>
                  <button onClick={handleLogout} className="w-full text-left px-8 py-4 hover:bg-red-50 text-red-600 font-medium">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-3xl transition">Login</Link>
              <Link href="/signup" className="px-6 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-3xl transition">Create Account</Link>
            </div>
          )}

          {/* MOBILE HAMBURGER */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-3xl text-black">
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isOpen && (
          <div className="md:hidden bg-white border-t py-6 px-4">
            <div className="flex flex-col gap-6 text-lg font-medium">
              <Link href="/about" className="hover:text-blue-600">ABOUT</Link>
              <Link href="/security" className="hover:text-blue-600">SECURITY</Link>
              <Link href="/credits" className="hover:text-blue-600">CREDITS</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
