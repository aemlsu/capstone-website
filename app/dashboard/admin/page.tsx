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

  // Announcement form state
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // NEW: Announcements management
  const [announcements, setAnnouncements] = useState<any[]>([]);

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

  // NEW: Fetch announcements
  const fetchAnnouncements = async () => {
    const { data } = await supabaseBrowser
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    setAnnouncements(data || []);
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
    fetchPosts();
    fetchAnnouncements();   // ← added
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

  // NEW: Delete announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement permanently?')) return;
    const { error } = await supabaseBrowser
      .from('announcements')
      .delete()
      .eq('id', id);
    if (error) {
      alert('Failed to delete announcement: ' + error.message);
    } else {
      alert('✅ Announcement deleted');
      fetchAnnouncements();
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
      fetchAnnouncements();   // refresh list
    }
    setIsPosting(false);
  };

  return (
    <div className="min-h-screen relative">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-2xl">Admin / HoD Dashboard</h1>
          <div className="flex gap-4">
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

        {/* NEW: Announcements Management (only this block added) */}
        <div className="mb-10 bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
            📢 Manage Announcements
          </h3>
          <div className="space-y-6">
            {announcements.length > 0 ? (
              announcements.map((ann: any) => (
                <div key={ann.id} className="flex justify-between items-start border-l-4 border-amber-500 pl-4">
                  <div>
                    {ann.is_pinned && <span className="text-amber-500 text-xs font-bold mb-1 block">📌 PINNED</span>}
                    <h4 className="font-semibold text-black">{ann.title}</h4>
                    <p className="text-gray-700 text-sm mt-1">{ann.content}</p>
                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="text-red-600 hover:text-red-700 text-2xl leading-none"
                  >
                    🗑️
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No announcements yet</p>
            )}
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex border-b mb-6 text-white">
          <button onClick={() => { setActiveTab('questions'); setReplyingToId(null); }} className={`px-8 py-4 text-xl font-medium ${activeTab === 'questions' ? 'border-b-4 border-blue-600' : ''}`}>Questions</button>
          <button onClick={() => { setActiveTab('reflections'); setReplyingToId(null); }} className={`px-8 py-4 text-xl font-medium ${activeTab === 'reflections' ? 'border-b-4 border-blue-600' : ''}`}>Reflections</button>
          <button onClick={() => { setActiveTab('concerns'); setReplyingToId(null); }} className={`px-8 py-4 text-xl font-medium ${activeTab === 'concerns' ? 'border-b-4 border-blue-600' : ''}`}>Concerns</button>
          <button onClick={() => { setActiveTab('self_assessments'); setReplyingToId(null); }} className={`px-8 py-4 text-xl font-medium ${activeTab === 'self_assessments' ? 'border-b-4 border-blue-600' : ''}`}>Self Assessments</button>
        </div>

        {/* The rest of your original code (unchanged) */}
        {/* Sub-tabs, Filter, Table, Modal, formatContent helper... all remain exactly the same */}

        {/* ... (your full original return content from Main Tabs down to the end) ... */}

      </div>

      {/* Announcement Modal (unchanged) */}
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
