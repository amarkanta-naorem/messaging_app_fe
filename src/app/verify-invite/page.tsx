"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { verifyInviteCode } from "@/store/slices/inviteSlice";
import Link from "next/link";

export default function VerifyInvitePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [invitationCode, setInvitationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInvitationVerify = async () => {
    if (!invitationCode.trim()) {
      setError("Please enter an invitation code");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const result = await (dispatch as any)(verifyInviteCode(invitationCode.trim()));
      if (verifyInviteCode.fulfilled.match(result)) {
        router.push("/new-organisation");
      } else {
        setError((result.payload as string) || "Invalid or expired invite code");
      }
    } catch {
      setError("Failed to verify invitation code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex justify-between relative overflow-hidden bg-linear-to-br from-violet-600 via-purple-600 to-fuchsia-500 animate-gradient">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-10 right-10 w-40 h-40 bg-violet-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 left-20 w-60 h-60 bg-fuchsia-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          {/* Floating shapes for extra vibrancy */}
          <div className="absolute top-1/2 left-1/7 w-20 h-20 bg-white/10 rounded-2xl rotate-12 animate-bounce" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        </div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>

        {/* Gradient mesh overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          <div className="mb-10">
            <div className="relative">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full"></div>
              <div className="relative w-28 h-28 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-center tracking-tight drop-shadow-lg animate-fade-in">GlobiChat</h1>
          <p className="text-xl text-white/80 text-center max-w-lg leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Connect seamlessly with your team. Experience modern messaging that keeps you in the loop.
          </p>
          
          {/* Feature indicators */}
          <div className="mt-14 flex gap-8">
            <div className="flex items-center gap-3 text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Secure</span>
            </div>
            <div className="flex items-center gap-3 text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Fast</span>
            </div>
            <div className="flex items-center gap-3 text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Reliable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Verify Invite Form */}
      <div className="w-full lg:w-[40%] lg:rounded-l-[6rem] flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-linear-to-br from-violet-50 via-purple-50 to-fuchsia-50 relative overflow-hidden transition-colors duration-500">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 -right-40 w-80 h-80 bg-fuchsia-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.02]" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">GlobiChat</h1>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2.5 tracking-tight">Create Account</h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Enter your invitation code to get started
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="premium-alert-error mb-6">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Invitation Code Input */}
            <div className="form-field">
              <label htmlFor="invitation" className="form-label" style={{ color: '#334155' }}>Invitation Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <input
                  id="invitation"
                  type="text"
                  placeholder="Enter your invitation code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  className="premium-input premium-input-with-icon"
                  style={{ backgroundColor: '#ffffff', borderColor: error ? '#f87171' : '#e2e8f0', color: '#1e293b' }}
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={isLoading}
                className="premium-button-secondary flex-1"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleInvitationVerify}
                disabled={!invitationCode.trim() || isLoading}
                className="premium-button-primary flex-1"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="premium-spinner"></span>
                    Verifying...
                  </span>
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </div>

          {/* Footer - Sign In CTA */}
          <div className="mt-8 text-center">
            <p className="text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-violet-600 font-semibold hover:text-violet-700 transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
