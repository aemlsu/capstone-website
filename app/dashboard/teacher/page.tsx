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

  // Quick Ask Question State
  const [questionContent, setQuestionContent] = useState('');
  const [questionCategory, setQuestionCategory] = useState('Ap/Esp');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (user) {
        const { data } = await supabaseBrowser
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        setUserName(data?.full_name?.split(' ')[0] || 'Teacher');
      }
    };
    loadUser();

    const fetchMyPosts = async () => {
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) return;
      const tables = ['questions', 'reflections', 'concerns'];
      let allPosts: any[] = [];
      for (const table of tables) {
        const { data } = await supabaseBrowser
          .from(table)
          .select('*')
          .eq('author_id', userData.user.id)
          .order('created_at', { ascending: false })
          .limit(4);
        if (data) allPosts = [...allPosts, ...data];
      }
      allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMyPosts(allPosts.slice(0, 4));
    };
    fetchMyPosts();

    const fetchOnlineUsers = async () => {
      const { data } = await supabaseBrowser
        .from('profiles')
        .select('full_name, role')
        .eq('role', 'hod')
        .order('full_name');
      setOnlineUsers(data || []);
    };
    fetchOnlineUsers();
  }, []);

  const handleQuickAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionContent.trim()) return;

    setSubmitting(true);
    const { data: { user } } = await supabaseBrowser.auth.getUser();

    if (!user) {
      alert('Please log in first');
      setSubmitting(false);
      return;
    }

    const { error } = await supabaseBrowser
      .from('questions')
      .insert({
        author_id: user.id,
        category: questionCategory,
        content: questionContent.trim(),
      });

    if (error) {
      alert('Failed to post question: ' + error.message);
    } else {
      alert('✅ Question posted successfully!');
      setQuestionContent('');
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (userData.user) {
        const { data: newPosts } = await supabaseBrowser
          .from('questions')
          .select('*')
          .eq('author_id', userData.user.id)
          .order('created_at', { ascending: false })
          .limit(4);
        if (newPosts) setMyPosts(newPosts);
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat z-[-1]" style={{ backgroundImage: "url('/images/school-background.jpg')" }} />
      <div className="fixed inset-0 bg-black/40 z-[-1]" />

      <div className="max-w-[1380px] mx-auto px-10 py-10">
        {/* Header */}
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

        <div className="grid grid-cols-12 gap-8 items-stretch">   {/* ← This fixes alignment */}
          {/* LEFT: Online Status */}
          <div className="col-span-2">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl h-full">
              <h4 className="font-bold text-black mb-5 text-lg">Online Status</h4>
              <div className="space-y-4">
                {onlineUsers.length > 0 ? (
                  onlineUsers.map((u: any) => (
                    <div key={u.full_name} className="flex justify-between items-center">
                      <span className="text-black">HoD - {u.full_name}</span>
                      <span className="bg-green-500 text-white text-xs px-4 py-1 rounded-3xl">Online</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No HoD accounts found</p>
                )}
              </div>
            </div>
          </div>

          {/* CENTER: 1x4 cards - now same height as Resource Access */}
          <div className="col-span-7 grid grid-cols-4 gap-6">
            <Link href="/dashboard/teacher/ask-question" className="group">
              <div className="bg-[#f8e4c2] hover:bg-[#f5d9a8] transition rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center h-full">
                <div className="text-5xl mb-3">❓💬</div>
                <h3 className="text-xl font-bold text-black">ASK A QUESTION</h3>
              </div>
            </Link>
            <Link href="/dashboard/teacher/reflections" className="group">
              <div className="bg-[#c1e4f0] hover:bg-[#a8d9eb] transition rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center h-full">
                <div className="text-5xl mb-3">📝☁️</div>
                <h3 className="text-xl font-bold text-black">REFLECTIONS &amp; CONCERNS</h3>
              </div>
            </Link>
            <Link href="/resources" className="group">
              <div className="bg-[#f0e8c8] hover:bg-[#e8d9a8] transition rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center h-full">
                <div className="text-5xl mb-3">📚</div>
                <h3 className="text-xl font-bold text-black">RESOURCE LIBRARY</h3>
              </div>
            </Link>
            <Link href="/dashboard/teacher/toolkit" className="group">
              <div className="bg-[#d4f0c8] hover:bg-[#c0e8b0] transition rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center h-full">
                <div className="text-5xl mb-3">🧳🌍</div>
                <h3 className="text-xl font-bold text-black">TRANSITION TOOLKIT</h3>
              </div>
            </Link>
          </div>

          {/* RIGHT: Resource Access */}
          <div className="col-span-3">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl h-full">
              <h4 className="font-bold text-black mb-6 text-xl">Resource Access</h4>
              <div className="space-y-8">
                <a href="https://www.tpsdxb.com" target="_blank" className="flex items-center gap-4 hover:scale-105 transition">
                  <img src="/images/tps-logo.png" alt="TPS" className="h-11 w-auto" />
                  <span className="font-medium text-black">The Philippine School</span>
                </a>
                <a href="https://www.khda.gov.ae" target="_blank" className="flex items-center gap-4 hover:scale-105 transition">
                  <img src="/images/khda-logo.png" alt="KHDA" className="h-11 w-auto" />
                  <span className="font-medium text-black">KHDA</span>
                </a>
                <a href="https://www.moe.gov.ae" target="_blank" className="flex items-center gap-4 hover:scale-105 transition">
                  <img src="/images/moe-logo.png" alt="MOE" className="h-11 w-auto" />
                  <span className="font-medium text-black">Ministry of Education</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: My Postings + Teaching Tools (left) + Quick Question (right) */}
        <div className="grid grid-cols-12 gap-8 mt-16">
          <div className="col-span-6 space-y-8">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-3">📬 My Postings</h2>
              {myPosts.length === 0 ? (
                <p className="text-gray-500 text-center py-12">No posts yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {myPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-2xl p-5 border">
                      <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()} • {post.category}</p>
                      <p className="font-medium text-black line-clamp-3 mt-2">{post.title || post.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
              <h3 className="text-3xl font-bold text-black mb-8">TEACHING TOOLS &amp; PLATFORMS</h3>
              <div className="grid grid-cols-6 gap-8 text-center">
                <a href="https://kahoot.com" target="_blank" className="hover:scale-110 transition"><img src="/images/kahoot.png" alt="Kahoot" className="h-16 mx-auto" /></a>
                <a href="https://www.mentimeter.com" target="_blank" className="hover:scale-110 transition"><img src="/images/mentimeter.png" alt="Mentimeter" className="h-16 mx-auto" /></a>
                <a href="https://genyo.com" target="_blank" className="hover:scale-110 transition"><img src="/images/genyo.png" alt="Genyo" className="h-16 mx-auto" /></a>
                <a href="https://www.desmos.com" target="_blank" className="hover:scale-110 transition"><img src="/images/desmos.png" alt="Desmos" className="h-16 mx-auto" /></a>
                <a href="https://blooket.com" target="_blank" className="hover:scale-110 transition"><img src="/images/blooket.png" alt="Blooket" className="h-16 mx-auto" /></a>
                <a href="https://notebooklm.google.com" target="_blank" className="hover:scale-110 transition"><img src="/images/notebooklm.png" alt="NotebookLM" className="h-16 mx-auto" /></a>
              </div>
            </div>
          </div>

          {/* Quick Question on the right */}
          <div className="col-span-6">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl h-full">
              <h4 className="font-bold text-black text-2xl mb-6 text-center">Quick Question</h4>
              <form onSubmit={handleQuickAsk} className="space-y-6">
                <select
                  value={questionCategory}
                  onChange={(e) => setQuestionCategory(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-3xl px-6 py-4 text-black text-lg"
                >
                  <option>Ap/Esp</option>
                  <option>Arabic</option>
                  <option>English</option>
                  <option>Filipino</option>
                  <option>ICT/TLE</option>
                  <option>MAPEH</option>
                  <option>Math</option>
                  <option>MSCS</option>
                  <option>Science</option>
                  <option>KG</option>
                  <option>G1 & G2</option>
                </select>

                <textarea
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder="Type your question here..."
                  className="w-full h-40 bg-white border border-gray-300 rounded-3xl p-6 resize-none text-black"
                  required
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-5 rounded-3xl font-semibold text-xl transition"
                >
                  {submitting ? 'Posting...' : 'Post Question'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}