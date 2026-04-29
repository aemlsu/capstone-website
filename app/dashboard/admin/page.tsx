'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'questions' | 'reflections' | 'concerns'>('questions');
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});

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

  const filteredMainPosts = mainPosts.filter((post) => {
    if (categoryFilter === 'All Categories') return true;
    return post.category === categoryFilter;
  });

  const getReplies = (parentId: string) => allPosts.filter((p) => p.parent_id === parentId);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;

    const table = getTableName();
    const { error } = await supabaseBrowser.from(table).delete().eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      alert('Delete failed: ' + error.message);
    } else {
      alert('✅ Post deleted successfully');
      fetchPosts();
    }
  };

  const handleReply = async (postId: string) => {
    const text = replyContent[postId];
    if (!text?.trim()) return;

    const { data: { user } } = await supabaseBrowser.auth.getUser();
    const table = getTableName();
    const parent = allPosts.find(p => p.id === postId);
    const parentCategory = parent?.category || null;

    const { error } = await supabaseBrowser.from(table).insert({
      content: text,
      parent_id: postId,
      author_id: user?.id,
      category: parentCategory,
    });

    if (error) {
      alert('Failed to post reply: ' + error.message);
    } else {
      setReplyContent(prev => ({ ...prev, [postId]: '' }));
      setReplyingToId(null);
      fetchPosts();
    }
  };

  const exportCSV = () => {
    const csv = filteredMainPosts.map(p => 
      `${p.created_at?.split('T')[0] || ''},${p.category || ''},"${p.title || ''}","${p.content || ''}"`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen relative">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-2xl">Admin / HoD Dashboard</h1>
          
          <div className="flex gap-4">
            <button onClick={() => router.push('/resources')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-3xl flex items-center gap-2 text-lg font-medium">
              📚 Resource Library
            </button>
            <button onClick={() => router.push('/dashboard/teacher/toolkit')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-3xl flex items-center gap-2 text-lg font-medium">
              🛠️ Transition Toolkit
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6 text-white">
          <button onClick={() => { setActiveTab('questions'); setReplyingToId(null); }} className={`px-8 py-4 text-xl font-medium ${activeTab === 'questions' ? 'border-b-4 border-blue-600' : ''}`}>Questions</button>
          <button onClick={() => { setActiveTab('reflections'); setReplyingToId(null); }} className={`px-8 py-4 text-xl font-medium ${activeTab === 'reflections' ? 'border-b-4 border-blue-600' : ''}`}>Reflections</button>
          <button onClick={() => { setActiveTab('concerns'); setReplyingToId(null); }} className={`px-8 py-4 text-xl font-medium ${activeTab === 'concerns' ? 'border-b-4 border-blue-600' : ''}`}>Concerns</button>
        </div>

        {/* Filter + Export */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-white">Filter by category:</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white/90 text-black px-6 py-3 rounded-3xl">
              <option value="All Categories">All Categories</option>
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
          </div>
          <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-3xl flex items-center gap-2">↓ Export Current Tab as CSV</button>
        </div>

        {/* Table */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-6 text-black">Date</th>
                <th className="text-left p-6 text-black">Category</th>
                <th className="text-left p-6 text-black">Title / Content</th>
                <th className="text-center p-6 text-black">Up</th>
                <th className="text-center p-6 text-black">Down</th>
                <th className="text-center p-6 text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMainPosts.map((post) => {
                const replies = getReplies(post.id);
                return (
                  <>
                    <tr key={post.id} className="border-t">
                      <td className="p-6 text-black">{new Date(post.created_at).toLocaleDateString()}</td>
                      <td className="p-6 text-black">{post.category}</td>
                      <td className="p-6 text-black">
                        <strong>{post.title || 'Untitled'}</strong>
                        <p className="text-gray-700 text-sm mt-1 line-clamp-2">{post.content}</p>
                      </td>
                      <td className="p-6 text-center text-black">{post.upvotes || 0}</td>
                      <td className="p-6 text-center text-black">{post.downvotes || 0}</td>
                      <td className="p-6 text-center flex gap-4 justify-center">
                        <button 
                          onClick={() => setReplyingToId(replyingToId === post.id ? null : post.id)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {replyingToId === post.id ? 'Cancel' : 'Reply'}
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-700">🗑️</button>
                      </td>
                    </tr>

                    {replies.map((reply) => (
                      <tr key={reply.id} className="bg-gray-50 border-t">
                        <td className="p-6 text-gray-500 pl-12">↳ Reply</td>
                        <td className="p-6 text-gray-500"></td>
                        <td className="p-6 text-gray-700" colSpan={4}>{reply.content}</td>
                      </tr>
                    ))}

                    {replyingToId === post.id && (
                      <tr>
                        <td colSpan={6} className="p-6 bg-white/70">
                          <textarea
                            value={replyContent[post.id] || ''}
                            onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                            rows={3}
                            className="w-full p-4 rounded-2xl border text-black"
                            placeholder="Write your reply here..."
                          />
                          <div className="flex gap-4 mt-4">
                            <button onClick={() => { setReplyContent(prev => ({ ...prev, [post.id]: '' })); setReplyingToId(null); }} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-2xl">Cancel</button>
                            <button onClick={() => handleReply(post.id)} className="bg-blue-600 text-white px-8 py-3 rounded-3xl hover:bg-blue-700">Send Reply</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}