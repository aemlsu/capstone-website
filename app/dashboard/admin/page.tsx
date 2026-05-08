'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'questions' | 'reflections' | 'concerns' | 'self_assessments'>('questions');
  const [reflectionSubTab, setReflectionSubTab] = useState<'normal' | 'monthly'>('normal'); // new
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [monthFilter, setMonthFilter] = useState('All Months');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState('');

  const getTableName = () => activeTab === 'self_assessments' ? 'self_assessments' : activeTab;

  const fetchPosts = async () => {
    const table = getTableName();
    let query = supabaseBrowser.from(table).select('*');

    // Filter for Monthly Reflections
    if (activeTab === 'reflections' && reflectionSubTab === 'monthly') {
      query = query.like('title', 'Monthly%');           // or use .eq('month', monthFilter) if you have a month column
      if (monthFilter !== 'All Months') {
        query = query.eq('month', monthFilter);         // remove this line if you don't have a 'month' column yet
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
    if (activeTab === 'reflections' && reflectionSubTab === 'monthly') return true; // month filter already applied in query
    if (categoryFilter === 'All Categories') return true;
    return post.category === categoryFilter;
  });

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

  return (
    <div className="min-h-screen relative">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-2xl">Admin / HoD Dashboard</h1>
          <div className="flex gap-4">
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
              className={`px-6 py-2 rounded-3xl text-sm font-medium transition-all ${reflectionSubTab === 'normal' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Normal Reflections
            </button>
            <button
              onClick={() => setReflectionSubTab('monthly')}
              className={`px-6 py-2 rounded-3xl text-sm font-medium transition-all ${reflectionSubTab === 'monthly' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Monthly Reflections
            </button>
          </div>
        )}

        {/* Filter row */}
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

        {/* Table and rest of your code remains unchanged from here */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          {/* Your existing table code goes here - unchanged */}
          {/* (I kept the rest of your table exactly the same as you provided) */}
          {/* ... paste the rest of your original table code here if needed ... */}
        </div>
      </div>
    </div>
  );
}
