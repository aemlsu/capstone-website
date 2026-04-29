'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AskQuestionPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [category, setCategory] = useState('Ap/Esp');

  const fetchQuestions = async () => {
    const { data } = await supabaseBrowser
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });
    setAllPosts(data || []);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Main questions only
  const mainQuestions = allPosts.filter((post) => !post.parent_id);

  const getReplies = (parentId: string) => {
    return allPosts.filter((p) => p.parent_id === parentId);
  };

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const { data: { user } } = await supabaseBrowser.auth.getUser();

    const { error } = await supabaseBrowser
      .from('questions')
      .insert({
        title: newTitle || 'Untitled Question',
        content: newContent,
        category: category,
        author_id: user?.id,
      });

    if (!error) {
      setNewTitle('');
      setNewContent('');
      fetchQuestions();
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-8">Recent Questions</h1>

        {/* Post new question form */}
        <form onSubmit={handlePostQuestion} className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl mb-12">
          <input
            type="text"
            placeholder="Question title (optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-4 rounded-2xl border mb-4 text-black"
          />
          <textarea
            placeholder="Write your question here..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            className="w-full p-4 rounded-2xl border text-black mb-6"
          />
          <div className="flex gap-4 items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white text-black px-6 py-3 rounded-3xl border"
            >
              <option value="Ap/Esp">Ap/Esp</option>
              <option value="Arabic">Arabic</option>
              <option value="English">English</option>
              <option value="Filipino">Filipino</option>
              <option value="ICT/TLE">ICT/TLE</option>
              <option value="MAPEH">MAPEH</option>
              <option value="Math">Math</option>
              <option value="MSCS">MSCS</option>
              <option value="Science">Science</option>
              <option value="KG">KG</option>
              <option value="G1 & G2">G1 & G2</option>
            </select>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-3xl font-medium">
              Post Question
            </button>
          </div>
        </form>

        {/* Questions + Replies */}
        <div className="space-y-8">
          {mainQuestions.length === 0 ? (
            <p className="text-white text-center py-12">No questions yet. Be the first to ask!</p>
          ) : (
            mainQuestions.map((q) => {
              const replies = getReplies(q.id);
              return (
                <div key={q.id} className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
                  {/* Main Question */}
                  <h3 className="text-2xl font-semibold text-black">{q.title || 'Untitled Question'}</h3>
                  <p className="text-gray-900 mt-3 text-[17px]">{q.content}</p>
                  <p className="text-xs text-gray-500 mt-6">
                    Posted in <span className="font-medium">{q.category}</span>
                  </p>

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="mt-10 space-y-6">
                      {replies.map((reply) => (
                        <div key={reply.id} className="pl-8 border-l-4 border-blue-200">
                          <p className="text-gray-600 text-sm">↳ Reply from HoD/Admin</p>
                          <p className="text-gray-800 mt-1">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}