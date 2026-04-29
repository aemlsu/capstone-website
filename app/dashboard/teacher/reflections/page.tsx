'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

export default function ReflectionsAndConcernsPage() {
  const [activeTab, setActiveTab] = useState<'reflections' | 'concerns'>('reflections');
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [newContent, setNewContent] = useState('');
  const [category, setCategory] = useState('Ap/Esp');

  const getTableName = () => activeTab;

  const fetchPosts = async () => {
    const table = getTableName();
    const { data } = await supabaseBrowser
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });
    setAllPosts(data || []);
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const mainPosts = allPosts.filter((post) => !post.parent_id);

  const getReplies = (parentId: string) => allPosts.filter((p) => p.parent_id === parentId);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const { data: { user } } = await supabaseBrowser.auth.getUser();
    const table = getTableName();

    const { error } = await supabaseBrowser
      .from(table)
      .insert({
        title: activeTab === 'reflections' ? 'Reflection' : 'Concern',
        content: newContent,
        category: category,
        author_id: user?.id,
      });

    if (!error) {
      setNewContent('');
      fetchPosts();
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-8">
          {activeTab === 'reflections' ? 'Recent Reflections' : 'Recent Concerns'}
        </h1>

        {/* Tabs */}
        <div className="flex border-b mb-8 text-white">
          <button
            onClick={() => { setActiveTab('reflections'); }}
            className={`px-8 py-4 text-xl font-medium ${activeTab === 'reflections' ? 'border-b-4 border-blue-600' : 'opacity-70'}`}
          >
            Reflections
          </button>
          <button
            onClick={() => { setActiveTab('concerns'); }}
            className={`px-8 py-4 text-xl font-medium ${activeTab === 'concerns' ? 'border-b-4 border-blue-600' : 'opacity-70'}`}
          >
            Concerns
          </button>
        </div>

        {/* Post new form */}
        <form onSubmit={handlePost} className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl mb-12">
          <textarea
            placeholder={activeTab === 'reflections' ? "Share your reflection here..." : "Share your concern here..."}
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
              {activeTab === 'reflections' ? 'Post Reflection' : 'Post Concern'}
            </button>
          </div>
        </form>

        {/* Posts + Replies */}
        <div className="space-y-8">
          {mainPosts.length === 0 ? (
            <p className="text-white text-center py-12">
              No {activeTab} yet.
            </p>
          ) : (
            mainPosts.map((post) => {
              const replies = getReplies(post.id);
              return (
                <div key={post.id} className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
                  <h3 className="text-2xl font-semibold text-black">
                    {post.title || (activeTab === 'reflections' ? 'Reflection' : 'Concern')}
                  </h3>
                  <p className="text-gray-900 mt-3 text-[17px]">{post.content}</p>
                  <p className="text-xs text-gray-500 mt-6">
                    Posted in <span className="font-medium">{post.category}</span>
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