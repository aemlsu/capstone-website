'use client';

import { useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabaseBrowser
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // Correct redirect for Admin and HoD
      if (profile?.role === 'teacher') {
        router.push('/dashboard/teacher');
      } else {
        router.push('/dashboard/admin');
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-xl text-black">Redirecting to your dashboard...</p>
    </div>
  );
}