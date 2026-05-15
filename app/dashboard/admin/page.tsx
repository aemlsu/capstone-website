'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'questions' | 'reflections' | 'concerns' | 'self_assessments'>('questions');
  const [reflectionSubTab, setReflectionSubTab] = useState<'normal' | 'monthly'>('normal');
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [monthFilter, setMonthFilter] = useState('All Months');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState('');

  // NEW: Announcement form state (only these 3 lines added)
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const getTableName = () => activeTab === 'self_assessments' ? 'self_assessments' : activeTab;

  const fetchPosts = async () => {
    const table = getTableName();

    let query = supabaseBrowser.from(table).select('*');

    if (activeTab === 'reflections' && reflectionSubTab === 'monthly') {
      query = query.like('title', 'Monthly%');
      if (monthFilter !== 'All Months') {
        query = query.eq('month', monthFilter);
      }
    }

    const { data } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    setAllPosts(data || []);
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
    fetchPosts();
  }, [activeTab, reflectionSubTab, monthFilter]);

  const mainPosts = allPosts.filter((post) => !post.parent_id);

  const filteredMainPosts = mainPosts.filter((post) => {
    if (activeTab === 'reflections') {
      if (reflectionSubTab === 'monthly') return true;
      return !post.title?.startsWith('Monthly');
    }
    if (categoryFilter === 'All Categories') return true;
    return post.category === categoryFilter;
  });

  const formatContent = (content: string) => {
    if (!content) return '';
    return content
      .replace(/Q1:/g, '<br><br><strong>Q1:</strong>')
      .replace(/Q2:/g, '<br><br><strong>Q2:</strong>')
      .replace(/Q3:/g, '<br><br><strong>Q3:</strong>')
      .replace(/<strong>Q1:<\/strong>(.*?)(?=<strong>Q2:|$)/g, '<strong>Q1:</strong> <strong>$1</strong>')
      .replace(/<strong>Q2:<\/strong>(.*?)(?=<strong>Q3:|$)/g, '<strong>Q2:</strong> <strong>$1</strong>')
      .replace(/<strong>Q3:<\/strong>(.*?)$/g, '<strong>Q3:</strong> <strong>$1</strong>');
  };

  const getReplies = (parentId: string) => allPosts.filter((p) => p.parent_id === parentId);

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedPosts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedPosts(newSet);
  };

  const handlePin = async (id: string) => {
    const table = getTableName();
    const post = allPosts.find(p => p.id === id);
    if (!post) return;
    const newPinned = !post.is_pinned;
    const { error } = await supabaseBrowser.from(table).update({ is_pinned: newPinned }).eq('id', id);
    if (error) alert('Failed to pin: ' + error.message);
    else fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    const table = getTableName();
    const { error } = await supabaseBrowser.from(table).delete().eq('id', id);
    if (error) alert('Delete failed: ' + error.message);
    else {
      alert('✅ Post deleted successfully');
      fetchPosts();
    }
  };

  const startEditReply = (reply: any) => {
    setEditingReplyId(reply.id);
    setEditReplyContent(reply.content || '');
  };

  const saveEditReply = async () => {
    if (!editingReplyId) return;
    const table = getTableName();
    const { error } = await supabaseBrowser.from(table).update({ content: editReplyContent }).eq('id', editingReplyId);
    if (error) alert('Failed to update reply: ' + error.message);
    else {
      alert('✅ Reply updated successfully');
      setEditingReplyId(null);
      fetchPosts();
    }
  };

  const cancelEditReply = () => setEditingReplyId(null);

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
    if (error) alert('Failed to post reply: ' + error.message);
    else {
      setReplyContent(prev => ({ ...prev, [postId]: '' }));
      setReplyingToId(null);
      fetchPosts();
    }
  };

  const exportCSV = () => {
    if (activeTab === 'self_assessments') {
      const csv = allPosts.map(p => 
        `${p.created_at?.split('T')[0] || ''},Unknown Teacher,${p.curriculum || ''},${p.classroom || ''},${p.cultural || ''},${p.assessment || ''},${p.technology || ''},"${p.notes || ''}"`
      ).join('\n');
      const blob = new Blob(['Date,Teacher,Curriculum,Classroom,Cultural,Assessment,Technology,Notes\n' + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'self_assessments.csv';
      a.click();
      return;
    }

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

  // NEW: Post Announcement function (only this was added)
  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    setIsPosting(true);
    const { data: { user } } = await supabaseBrowser.auth.getUser();

    const { error } = await supabaseBrowser
      .from('announcements')
      .insert({
        title: annTitle,
        content: annContent,
        author_id: user?.id,
      });

    if (error) {
      alert('Failed to post announcement: ' + error.message);
    } else {
      alert('✅ Announcement posted successfully!');
      setAnnTitle('');
      setAnnContent('');
      setShowAnnouncementForm(false);
    }
    setIsPosting(false);
  };

  return (
    <div className="min-h-screen relative">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-2xl">Admin / HoD Dashboard</h1>
          <div className="flex gap-4">
            {/* NEW: Post Announcement Button (only this line added) */}
            <button 
              onClick={() => setShowAnnouncementForm(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-3xl flex items-center gap-2 text-lg font-medium"
            >
              📢 Post Announcement
            </button>

            <button onClick={() => router.push('/resources')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-3xl flex items-center gap-2 text-lg font-medium">📚 Resource Library</button>
            <button onClick={() => router.push('/dashboard/teacher/toolkit')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-3xl flex items-center gap-2 text-lg font-medium">🛠️ Transition Toolkit</button>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex border-b mb-6 text-white">
          <button onClick={() => { setActiveTab('questions'); setReplyingToId(null); }} className={`px-8 py-4 text-xl font-medium ${activeTab === 'questions' ? 'border-b-4 border-blue-600' : ''}`}>Questions</button>
          <button onClick={() => { setActiveTab('reflections'); setReplyingToId(null); }} className={`px-8 py-4 text-xl font-medium ${activeTab === 'reflections' ? 'border-b-4 border-blue-600' : ''}`}>Reflections</button>
          <button onClick={() => { setActiveTab('concerns'); setReplyingToId(null); }} className={`px-8 py-4 text-xl font-medium ${activeTab === 'concerns' ? 'border-b-4 border-blue-600' : ''}`}>Concerns</button>
          <button onClick={() => { setActiveTab('self_assessments'); setReplyingToId(null); }} className={`px-8 py-4 text-xl font-medium ${activeTab === 'self_assessments' ? 'border-b-4 border-blue-600' : ''}`}>Self Assessments</button>
        </div>

        {/* Sub-tabs inside Reflections */}
        {activeTab === 'reflections' && (
          <div className="flex gap-2 mb-6 border-b pb-2">
            <button
              onClick={() => setReflectionSubTab('normal')}
              className={`px-6 py-2 rounded-3xl text-sm font-medium transition-all ${
                reflectionSubTab === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Normal Reflections
            </button>
            <button
              onClick={() => setReflectionSubTab('monthly')}
              className={`px-6 py-2 rounded-3xl text-sm font-medium transition-all ${
                reflectionSubTab === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly Reflections
            </button>
          </div>
        )}

        {/* Filter + Export */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-white">
              {activeTab === 'reflections' && reflectionSubTab === 'monthly' ? 'Filter by Month:' : 'Filter by category:'}
            </span>
            
            {activeTab === 'reflections' && reflectionSubTab === 'monthly' ? (
              <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="bg-white/90 text-black px-6 py-3 rounded-3xl">
                <option value="All Months">All Months</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
              </select>
            ) : (
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white/90 text-black px-6 py-3 rounded-3xl">
                <option value="All Categories">All Categories</option>
                <option value="General">General</option>
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
            )}
          </div>
          <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-3xl flex items-center gap-2">↓ Export Current Tab as CSV</button>
        </div>

        {/* Table */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                {activeTab === 'self_assessments' ? (
                  <>
                    <th className="text-left p-6 text-black">Date</th>
                    <th className="text-left p-6 text-black">Teacher</th>
                    <th className="text-center p-6 text-black">Curriculum</th>
                    <th className="text-center p-6 text-black">Classroom</th>
                    <th className="text-center p-6 text-black">Cultural</th>
                    <th className="text-center p-6 text-black">Assessment</th>
                    <th className="text-center p-6 text-black">Technology</th>
                    <th className="text-left p-6 text-black">Notes</th>
                  </>
                ) : (
                  <>
                    <th className="text-left p-6 text-black">Date</th>
                    <th className="text-left p-6 text-black">Category</th>
                    <th className="text-left p-6 text-black">Title / Content</th>
                    <th className="text-center p-6 text-black">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'self_assessments' ? (
                allPosts.map((sa: any) => (
                  <tr key={sa.id} className="border-t">
                    <td className="p-6 text-black">{new Date(sa.created_at).toLocaleDateString()}</td>
                    <td className="p-6 text-black">Teacher</td>
                    <td className="p-6 text-center text-black">{sa.curriculum || '-'}</td>
                    <td className="p-6 text-center text-black">{sa.classroom || '-'}</td>
                    <td className="p-6 text-center text-black">{sa.cultural || '-'}</td>
                    <td className="p-6 text-center text-black">{sa.assessment || '-'}</td>
                    <td className="p-6 text-center text-black">{sa.technology || '-'}</td>
                    <td className="p-6 text-black">{sa.notes || '-'}</td>
                  </tr>
                ))
              ) : (
                filteredMainPosts.map((post) => {
                  const replies = getReplies(post.id);
                  const isExpanded = expandedPosts.has(post.id);
                  return (
                    <>
                      <tr key={post.id} className="border-t">
                        <td className="p-6 text-black">{new Date(post.created_at).toLocaleDateString()}</td>
                        <td className="p-6 text-black">{post.category}</td>
                        <td className="p-6 text-black">
                          {post.is_pinned && <span className="text-amber-500 mr-2">📌</span>}
                          <strong className="font-bold text-black text-lg block">
                            {post.title || 'Untitled'}
                          </strong>
                          <p 
                            className={`text-gray-700 text-sm mt-1 ${isExpanded ? '' : 'line-clamp-3'}`}
                            dangerouslySetInnerHTML={{ 
                              __html: activeTab === 'reflections' && reflectionSubTab === 'monthly' 
                                ? formatContent(post.content) 
                                : post.content 
                            }}
                          />
                          {post.content && post.content.length > 120 && (
                            <button onClick={() => toggleExpand(post.id)} className="text-blue-600 text-xs mt-2 hover:underline flex items-center gap-1">
                              {isExpanded ? '▲ Read less' : '▼ Read more'}
                            </button>
                          )}
                        </td>
                        <td className="p-6 text-center flex gap-4 justify-center">
                          <button onClick={() => setReplyingToId(replyingToId === post.id ? null : post.id)} className="text-blue-600 hover:text-blue-700 font-medium">
                            {replyingToId === post.id ? 'Cancel' : 'Reply'}
                          </button>
                          <button 
                            onClick={() => handlePin(post.id)}
                            className={`font-medium ${post.is_pinned ? 'text-amber-500' : 'text-gray-500 hover:text-amber-500'}`}
                          >
                            {post.is_pinned ? '📌 Unpin' : '📌 Pin'}
                          </button>
                          <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-700">🗑️</button>
                        </td>
                      </tr>

                      {replies.map((reply) => {
                        const isOwnReply = currentUserId && reply.author_id === currentUserId;
                        const isEditingThisReply = editingReplyId === reply.id;
                        return (
                          <tr key={reply.id} className="bg-gray-50 border-t">
                            <td className="p-6 text-gray-500 pl-12">↳ Reply</td>
                            <td className="p-6 text-gray-500"></td>
                            <td className="p-6 text-gray-700" colSpan={2}>
                              {isEditingThisReply ? (
                                <div>
                                  <textarea value={editReplyContent} onChange={(e) => setEditReplyContent(e.target.value)} rows={2} className="w-full p-3 rounded-2xl border text-black" />
                                  <div className="flex gap-3 mt-3">
                                    <button onClick={saveEditReply} className="bg-green-600 text-white px-5 py-2 rounded-3xl text-sm">Save</button>
                                    <button onClick={cancelEditReply} className="bg-gray-500 text-white px-5 py-2 rounded-3xl text-sm">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <p>{reply.content}</p>
                              )}
                            </td>
                            <td className="p-6 text-center flex gap-3">
                              {isOwnReply && !isEditingThisReply && (
                                <>
                                  <button onClick={() => startEditReply(reply)} className="text-blue-600 hover:text-blue-700">✏️</button>
                                  <button onClick={() => handleDelete(reply.id)} className="text-red-600 hover:text-red-700">🗑️</button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {replyingToId === post.id && (
                        <tr>
                          <td colSpan={5} className="p-6 bg-white/70">
                            <textarea value={replyContent[post.id] || ''} onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))} rows={3} className="w-full p-4 rounded-2xl border text-black" placeholder="Write your reply here..." />
                            <div className="flex gap-4 mt-4">
                              <button onClick={() => { setReplyContent(prev => ({ ...prev, [post.id]: '' })); setReplyingToId(null); }} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-2xl">Cancel</button>
                              <button onClick={() => handleReply(post.id)} className="bg-blue-600 text-white px-8 py-3 rounded-3xl hover:bg-blue-700">Send Reply</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW: Announcement Modal (only this block was added at the end) */}
      {showAnnouncementForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Post New Announcement</h2>
            <form onSubmit={postAnnouncement}>
              <input
                type="text"
                placeholder="Announcement Title"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-3xl px-6 py-4 mb-4 text-black"
                required
              />
              <textarea
                placeholder="Write the announcement here..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-3xl px-6 py-4 mb-6 text-black resize-none"
                required
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementForm(false)}
                  className="flex-1 py-4 text-gray-600 border border-gray-300 rounded-3xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="flex-1 py-4 bg-amber-600 text-white rounded-3xl font-semibold"
                >
                  {isPosting ? 'Posting...' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to bold questions + add spacing
const formatContent = (content: string) => {
  if (!content) return '';
  return content
    .replace(/Q1:/g, '<br><br><strong>Q1:</strong>')
    .replace(/Q2:/g, '<br><br><strong>Q2:</strong>')
    .replace(/Q3:/g, '<br><br><strong>Q3:</strong>')
    .replace(/<strong>Q1:<\/strong>(.*?)(?=<strong>Q2:|$)/g, '<strong>Q1:</strong> <strong>$1</strong>')
    .replace(/<strong>Q2:<\/strong>(.*?)(?=<strong>Q3:|$)/g, '<strong>Q2:</strong> <strong>$1</strong>')
    .replace(/<strong>Q3:<\/strong>(.*?)$/g, '<strong>Q3:</strong> <strong>$1</strong>');
};
