'use client';

export default function CreditsPage() {
  return (
    <div className="min-h-screen relative">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-8 text-center">
          Credits &amp; Acknowledgements
        </h1>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-black">
          <h2 className="text-3xl font-semibold mb-6">This Website</h2>
          <p className="text-lg leading-relaxed mb-8">
            This platform was developed as the <strong>Capstone Project</strong> of the research study titled:
          </p>
          <p className="text-xl font-medium italic text-center mb-10">
            “Filipino Teachers’ Experiences of Shifting from Philippine to UAE-Based Teaching Approaches”
          </p>

          <h2 className="text-3xl font-semibold mb-6">Research Team (Grade 12-A STEM)</h2>
          <ul className="space-y-2 text-lg mb-10">
            <li>Calyx Zamira G. Garduque</li>
            <li>Ernest Zach B. Enriquez</li>
            <li>Arhianne Justine D. Dela Fuente</li>
            <li>Angel Zena Ross D. Galon</li>
            <li>Mark Samuel M. Suquila</li>
            <li>Zeth Rojan Reisse C. Umali</li>
          </ul>

          <h2 className="text-3xl font-semibold mb-6">Advisers &amp; School Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <p className="font-medium">Research Adviser</p>
              <p>Mr. Renato A. Dela Peña Jr., M.A.</p>
            </div>
            <div>
              <p className="font-medium">Capstone Teacher</p>
              <p>Ms. Bianca Camille P. Mistal</p>
            </div>
            <div>
              <p className="font-medium">School Principal</p>
              <p>Dr. Rommel E. Pelayo, Ed.D.</p>
            </div>
            <div>
              <p className="font-medium">VP for Academics</p>
              <p>Dr. Allan T. Cariaga, Ph.D.</p>
            </div>
          </div>

          <h2 className="text-3xl font-semibold mb-6">Special Thanks</h2>
          <div className="text-lg leading-relaxed space-y-6">
            <p>
              To <strong>Dr. Romel E. Pelayo</strong>, our Principal, to school and Dr Romel for their guidance, support, 
              and encouragement throughout this project.
            </p><p>
              To <strong>Dr. Allan T. Cariaga, Ph.D.</strong>, VP for Academics, for his guidance, encouragement, 
              and continuous support throughout the entire research and development process.
            </p>
            <p>
          
              To <strong>Ms. Bianca Camille P. Mistal</strong> (Capstone Teacher) and <strong>Renato A. Dela Peña Jr., M.A.</strong> for their mentorship, 
              patience, and continuous support during the entire research process.
            </p>
                To <strong>Sir Sean Buscano</strong> for his invaluable technical assistance in building and developing this website.
            <p></p>
            <p>
            </p>
            <p>
              To Mr. Michael Aniag (Librarian) for providing a comfortable space for the interviews.
            </p>
            <p>
              To the expert validators: Ms. Queen Irish C. Alagad, Ms. Cathleen L. Castro, Ms. Bianca Camille P. Mistal, 
              Ms. Rhea P. Rosete, and Ms. Emelita D. Urbano.
            </p>
            <p>
              To the SHS Research Ethics Committee: Ms. Cathleen L. Castro, Ms. Bianca Camille P. Mistal, and Ms. Richelle A. Costa.
            </p>
            <p>
              To our families, friends, and loved ones for their unwavering support and encouragement.
            </p>
            <p className="font-medium">
              Above all, to God for the strength, guidance, and perseverance that made this study possible. 
              To God be all the glory. Shukraan po!
            </p>
          </div>

          <h2 className="text-3xl font-semibold mt-12 mb-6">Website Development</h2>
          <p className="text-lg leading-relaxed">
            Built by <strong>Mark Samuel M. Suquila, Calyx Zamira Galang Garduque, & Angel Zena Ross Galon</strong> with the assistance of Grok (xAI) as the AI development partner.
          </p>

          <div className="text-center mt-16 text-sm text-gray-500 border-t pt-8">
            © 2026 The Philippine School Dubai • Teacher Mentorship &amp; Collaboration Platform<br />
            Capstone Project for Research in Daily Life
          </div>
        </div>
      </div>
    </div>
  );
}