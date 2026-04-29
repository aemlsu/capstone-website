export default function AboutPage() {
  return (
    <>
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-12">
          
          <h1 className="text-5xl font-bold text-black mb-2">About AdaptBridge</h1>
          <p className="text-3xl text-gray-700 mb-12">Teacher Mentorship &amp; Adaptation Platform</p>

          <div className="prose text-xl text-gray-800 max-w-none">
            <p className="mb-12">
              This platform supports Filipino teachers transitioning to schools in the UAE. 
              It provides a space for reflections, resource sharing, mentorship, and professional growth.
            </p>

            <h2 className="text-4xl font-semibold text-black mb-8">School Leadership Team</h2>

            {/* HoD Table */}
            <h3 className="text-2xl font-semibold text-black mb-4">Heads of Department (HoD)</h3>
            <table className="w-full border-collapse mb-16">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-6 py-4 text-left">Position</th>
                  <th className="border border-gray-300 px-6 py-4 text-left">Name</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 px-6 py-4">HoD – AP/EsP</td><td className="border border-gray-300 px-6 py-4">Mr. Rafael B. Carlos</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">HoD – Arabic</td><td className="border border-gray-300 px-6 py-4">Ms. Mai Salim Alfakharany</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">HoD – English</td><td className="border border-gray-300 px-6 py-4">Ms. Rhea P. Rosete</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">HoD – Filipino</td><td className="border border-gray-300 px-6 py-4">Mr. Jessie Y. De Guzman</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">HoD – ICT/TLE</td><td className="border border-gray-300 px-6 py-4">M. John Anthony V. Bonayon</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">HoD – MAPEH</td><td className="border border-gray-300 px-6 py-4">Ms. Maebel C. Able</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">HoD – Math</td><td className="border border-gray-300 px-6 py-4">Mr. Wilson Q. Rebusa</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">HoD – MSCS</td><td className="border border-gray-300 px-6 py-4">Mr. Roque P. Caniban</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">HoD – Science</td><td className="border border-gray-300 px-6 py-4">Ms. Madonna N. Timbang</td></tr>
              </tbody>
            </table>

            {/* School Administration */}
            <h3 className="text-2xl font-semibold text-black mb-4">School Administration</h3>
            <table className="w-full border-collapse mb-16">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-6 py-4 text-left">Position</th>
                  <th className="border border-gray-300 px-6 py-4 text-left">Name</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 px-6 py-4">Principal</td><td className="border border-gray-300 px-6 py-4">Dr. Romel P. Pelayo</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">Vice Principal</td><td className="border border-gray-300 px-6 py-4">Dr. Allan T. Cariaga</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">HoC – Cycles 1 &amp; 2</td><td className="border border-gray-300 px-6 py-4">Ms. Juliet G. Balos</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">HoC – Cycles 3 &amp; 4</td><td className="border border-gray-300 px-6 py-4">Ms. Marites P. Rodriguez</td></tr>
              </tbody>
            </table>

            {/* KG & Lower Grades */}
            <h3 className="text-2xl font-semibold text-black mb-4">HoD / GLC – Kindergarten &amp; Lower Grades</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-6 py-4 text-left">Position</th>
                  <th className="border border-gray-300 px-6 py-4 text-left">Name</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 px-6 py-4">HoD/GLC – KG</td><td className="border border-gray-300 px-6 py-4">Ms. Andrea Marie T. Anastacio</td></tr>
                <tr><td className="border border-gray-300 px-6 py-4">HoD/GLC – G1 &amp; G2</td><td className="border border-gray-300 px-6 py-4">Ms. Jenileen T. Borbe</td></tr>
              </tbody>
            </table>

            {/* PARTNERSHIP LOGOS SECTION */}
            <h2 className="text-4xl font-semibold text-black mt-16 mb-8 text-center">Offical Websites</h2>
            <div className="flex flex-wrap justify-center items-center gap-16">
              <a href="https://tpsdxb.com/" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                <img src="/images/tps-logo.png" alt="The Philippine School" className="h-20 object-contain" />
              </a>
              <a href="https://web.khda.gov.ae/" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                <img src="/images/khda-logo.png" alt="KHDA" className="h-20 object-contain" />
              </a>
              <a href="https://www.moe.gov.ae/" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                <img src="/images/moe-logo.png" alt="Ministry of Education UAE" className="h-20 object-contain" />
              </a>
            </div>
          </div>
        </div>
    </>
  );
}