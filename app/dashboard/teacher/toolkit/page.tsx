'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TransitionToolkit() {
  const [activeTab, setActiveTab] = useState<'images' | 'assessment'>('images');

  return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-bold text-white">Transition Toolkit</h1>
          <Link 
            href="/dashboard/teacher" 
            className="text-white hover:underline text-xl flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-3xl shadow-inner p-1 mb-10 w-fit">
          <button
            onClick={() => setActiveTab('images')}
            className={`px-10 py-4 rounded-3xl font-medium transition ${
              activeTab === 'images' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            Toolkit Resources
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-10 py-4 rounded-3xl font-medium transition ${
              activeTab === 'assessment' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            Self Assessment
          </button>
        </div>

        {/* IMAGES TAB - Full large images, scroll down to see */}
        {activeTab === 'images' && (
          <div className="space-y-12">
            <div>
              <img 
                src="/images/toolkit-1.jpg" 
                alt="Toolkit Resource 1" 
                className="w-full rounded-3xl shadow-2xl"
              />
            </div>
            <div>
              <img 
                src="/images/toolkit-2.jpg" 
                alt="Toolkit Resource 2" 
                className="w-full rounded-3xl shadow-2xl"
              />
            </div>
            <div>
              <img 
                src="/images/toolkit-3.jpg" 
                alt="Toolkit Resource 3" 
                className="w-full rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* SELF ASSESSMENT TAB - kept exactly as before */}
        {activeTab === 'assessment' && (
          <div className="bg-white rounded-3xl p-10 shadow-xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">Teacher Self-Assessment</h2>
            <p className="text-center text-gray-600 mb-10">Rate your current confidence level (1 = Not confident, 5 = Very confident)</p>

            {/* Self Assessment Form (unchanged from previous version) */}
            <form className="space-y-8">
              <div>
                <label className="block text-black font-medium mb-2">1. Implementing UAE Curriculum &amp; Standards</label>
                <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-blue-600" />
                <div className="flex justify-between text-sm text-gray-500"><span>1</span><span>5</span></div>
              </div>

              <div>
                <label className="block text-black font-medium mb-2">2. Classroom Management in UAE Context</label>
                <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-blue-600" />
                <div className="flex justify-between text-sm text-gray-500"><span>1</span><span>5</span></div>
              </div>

              <div>
                <label className="block text-black font-medium mb-2">3. Cultural &amp; Social Adaptation</label>
                <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-blue-600" />
                <div className="flex justify-between text-sm text-gray-500"><span>1</span><span>5</span></div>
              </div>

              <div>
                <label className="block text-black font-medium mb-2">4. Assessment &amp; Feedback Practices</label>
                <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-blue-600" />
                <div className="flex justify-between text-sm text-gray-500"><span>1</span><span>5</span></div>
              </div>

              <div>
                <label className="block text-black font-medium mb-2">5. Technology Integration in Teaching</label>
                <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-blue-600" />
                <div className="flex justify-between text-sm text-gray-500"><span>1</span><span>5</span></div>
              </div>

              <div>
                <label className="block text-black font-medium mb-2">Additional Notes / Reflections</label>
                <textarea className="w-full h-32 border rounded-3xl p-6" placeholder="Any thoughts or areas you want to improve..." />
              </div>

              <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl text-xl font-semibold">
                Submit Self Assessment
              </button>
            </form>
          </div>
        )}
      </div>
  );
}