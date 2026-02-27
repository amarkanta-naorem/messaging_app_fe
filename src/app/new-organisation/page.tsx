import { getPageMetadata } from "@/lib/metadata";
import NewOrganisationForm from "./NewOrganisationForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const metadata = getPageMetadata("organisations");

export default function NewOrganisationPage() {
  return (
    <ProtectedRoute>
      <main className="max-h-screen flex justify-between relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 animate-gradient">
        {/* Left Side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-10 right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-20 left-20 w-60 h-60 bg-indigo-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            {/* Floating shapes for extra vibrancy */}
            <div className="absolute top-1/2 left-1/7 w-20 h-20 bg-white/10 rounded-2xl rotate-12 animate-bounce" style={{ animationDuration: '3s' }}></div>
            <div className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          </div>
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>

          {/* Gradient mesh overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
            <div className="mb-8">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full"></div>
                <div className="relative w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 border border-white/30 transform hover:scale-105 transition-transform duration-300">
                  <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-center tracking-tight drop-shadow-lg animate-fade-in">Create Your Organisation</h1>
            <p className="text-xl text-white/80 text-center max-w-md leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>Set up your organisation to start collaborating with your team.</p>
            
            {/* Feature indicators */}
            <div className="mt-12 flex flex-wrap gap-6 justify-center">
              <div className="flex items-center gap-2.5 text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Free Setup</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Instant Access</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">No Credit Card</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Create Organisation Form */}
        <div className="w-full lg:w-[40%] lg:rounded-l-[7rem] flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-linear-to-br from-blue-50 via-indigo-50 to-violet-50 relative overflow-hidden transition-colors duration-500">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 -right-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-300/10 rounded-full blur-3xl"></div>
          </div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.02]" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}></div>
          
          <div className="relative z-10 w-full max-w-md">
            <NewOrganisationForm />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
