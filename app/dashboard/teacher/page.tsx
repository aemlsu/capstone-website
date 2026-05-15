'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import Link from 'next/link';

export default function TeacherDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Teacher');
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);   // ← NEW

  const [questionContent, setQuestionContent] = useState('');
  const [questionCategory, setQuestionCategory] = useState('Ap/Esp');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadUserAndUpdateStatus = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) return;

      await supabaseBrowser
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id);

      const { data } = await supabaseBrowser
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      setUserName(data?.full_name?.split(' ')[0] || 'Teacher');
    };

    loadUserAndUpdateStatus();

    const fetchMyPosts = async () => { /* ... your existing code ... */ };
    fetchMyPosts();

    const fetchOnlineUsers = async () => { /* ... your existing code ... */ };
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);

    // NEW: Fetch Announcements
    const fetchAnnouncements = async () => {
      const { data } = await supabaseBrowser
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);
      setAnnouncements(data || []);
    };
    fetchAnnouncements();
  }, [router]);

  const handleQuickAsk = async (e: React.FormEvent) => {
    // ... your existing function (unchanged)
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat z-[-1]" style={{ backgroundImage: "url('/images/school-background.jpg')" }} />
      <div className="fixed inset-0 bg-black/40 z-[-1]" />

      <div className="max-w-[1380px] mx-auto px-10 py-10">

        {/* NEW: Announcements Section */}
        {announcements.length > 0 && (
          <div className="mb-10 bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
              📢 Announcements
            </h3>
            <div className="space-y-6">
              {announcements.map((ann: any) => (
                <div key={ann.id} className="border-l-4 border-amber-500 pl-4">
                  {ann.is_pinned && <span className="text-amber-500 text-xs font-bold mb-1 block">📌 PINNED</span>}
                  <h4 className="font-semibold text-black">{ann.title}</h4>
                  <p className="text-gray-700 text-sm mt-1">{ann.content}</p>
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Everything below this line is 100% your original code (unchanged) */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-6xl font-bold text-white drop-shadow-2xl">HELLO, {userName.toUpperCase()}!</h1>
            <p className="text-3xl text-white/90 mt-2">Welcome to TPS EduShift Support</p>
          </div>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl px-8 py-5 shadow-xl text-right">
            <p className="text-sm text-gray-600">Teacher Dashboard</p>
            <p className="text-2xl font-semibold text-black">Dubai Educator Transition Toolkit</p>
          </div>
        </div>

        {/* ... rest of your dashboard (grid, cards, etc.) remains exactly the same ... */}

      </div>
    </div>
  );
}
