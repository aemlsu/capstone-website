'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const accessGranted = localStorage.getItem('accessGranted') === 'true';
    if (!accessGranted) {
      router.replace('/password-gate');
    }
  }, [router]);

  return (
    <div className="min-h-screen relative">
      {/* School Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-[-1]"
        style={{ backgroundImage: "url('/images/school-background.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/50 z-[-1]" />

      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-7xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-2xl mb-4">
            THE PHILIPPINE SCHOOL
          </h1>
          <p className="text-3xl md:text-4xl text-white/90 font-light mb-12 drop-shadow-xl">
            Leader in Academic Excellence and Values Formation
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/login" className="px-14 py-6 bg-white text-black text-2xl font-semibold rounded-3xl hover:bg-gray-100 transition shadow-2xl">
              Login
            </a>
            <a href="/signup" className="px-14 py-6 bg-transparent border-4 border-white text-white text-2xl font-semibold rounded-3xl hover:bg-white/10 transition shadow-2xl">
              Create Account
            </a>
          </div>

          <p className="mt-16 text-white/80 text-xl max-w-md">
            Welcome to the Teacher Mentorship &amp; Collaboration Platform
          </p>
        </div>

        {/* Tutorial Video Section - YouTube (unlimited size) */}
        <div className="py-20 bg-white/10 backdrop-blur-md border-t border-white/20">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              How to Use TPS EduShift Support
            </h2>
            <p className="text-white/80 text-lg mb-10">
              Watch this short tutorial to get started
            </p>

            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/30 mx-auto max-w-4xl bg-black">
              <iframe
                width="100%"
                height="640"
                src="https://www.youtube.com/embed/_EI3gAUTfQk"
                title="TPS EduShift Support Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              ></iframe>
            </div>

            <p className="text-white/60 text-sm mt-6">
              💡 Tip: Click the full-screen icon for the best experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
