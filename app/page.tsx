'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (user) {
        const { data: profile } = await supabaseBrowser
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'teacher') {
          router.push('/dashboard/teacher');
        } else {
          router.push('/dashboard/admin');
        }
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen relative">
      {/* School Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-[-1]"
        style={{ backgroundImage: "url('/images/school-background.jpg')" }}
      />
      
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 z-[-1]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-7xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-2xl mb-4">
          THE PHILIPPINE SCHOOL
        </h1>
        <p className="text-3xl md:text-4xl text-white/90 font-light mb-12 drop-shadow-xl">
          Leader in Academic Excellence and Values Formation
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/login"
            className="px-14 py-6 bg-white text-black text-2xl font-semibold rounded-3xl hover:bg-gray-100 transition shadow-2xl"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-14 py-6 bg-transparent border-4 border-white text-white text-2xl font-semibold rounded-3xl hover:bg-white/10 transition shadow-2xl"
          >
            Create Account
          </Link>
        </div>

        <p className="mt-16 text-white/80 text-xl max-w-md">
          Welcome to the Teacher Mentorship &amp; Collaboration Platform
        </p>
      </div>
    </div>
  );
}