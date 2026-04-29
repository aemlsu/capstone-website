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
        } else {
          setUserName('User');
        }
      } else {
        setIsLoggedIn(false);
        setUserName('');
      }
    };

    fetchUser();

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await supabaseBrowser.auth.signOut();
    window.location.href = '/login';
  };

  // Logged out version
  if (!isLoggedIn) {
    return (
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-[1380px] mx-auto px-10">
          <div className="h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img src="/images/logo.png" alt="Logo" className="h-14 w-auto" />
              <span className="text-3xl font-bold tracking-tight text-black ml-1">TPS EduShift Support</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/login" className="px-8 py-3 text-lg font-medium text-blue-600 hover:bg-blue-50 rounded-3xl transition">
                Login
              </Link>
              <Link href="/signup" className="px-8 py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-3xl transition">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Logged in version
  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-[1380px] mx-auto px-10">
        <div className="h-20 flex items-center justify-between">
          
          {/* LOGO + NAME STUCK AS ONE UNIT */}
          <Link href={homePath} className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="TPS EduShift Support Logo" 
              className="h-14 w-auto" 
            />
            <span className="text-3xl font-bold tracking-tight text-black ml-1">TPS EduShift Support</span>
          </Link>

          {/* MENU LINKS */}
          <div className="flex items-center gap-10 text-lg font-medium text-black">
            <Link href="/about" className="hover:text-blue-600 transition">ABOUT</Link>
            <Link href="/security" className="hover:text-blue-600 transition">SECURITY</Link>
            <Link href="/credits" className="hover:text-blue-600 transition">CREDITS</Link>
          </div>

          {/* ACCOUNT DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 hover:bg-gray-100 px-5 py-2 rounded-3xl transition"
            >
              <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-lg">
                👤
              </div>
              <span className="font-medium text-black">{userName}</span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-3xl shadow-2xl border py-3 z-50">
                <Link href="/dashboard/profile" className="block px-8 py-4 hover:bg-gray-100 text-black">
                  Profile
                </Link>
                <Link href="/dashboard/settings" className="block px-8 py-4 hover:bg-gray-100 text-black">
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-8 py-4 hover:bg-red-50 text-red-600 font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}