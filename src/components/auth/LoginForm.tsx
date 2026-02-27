"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "./PhoneInput";
import OtpInput from "./OtpInput";
import { sendOtp, verifyOtp } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

type LoginView = "phone" | "otp" | "invitation";

export default function LoginForm() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState<LoginView>("phone");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleRequestOtp = async () => {
    if (!phone.trim()) return;
    setError("");
    setIsLoading(true);
    try {
      await sendOtp(phone);
      setOtpSent(true);
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setError("");
    setIsLoading(true);
    try {
      const response = await verifyOtp(phone, otp);
      login(response.token, response.user);
      router.push("/chat");
    } catch {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvitationVerify = () => {
    if (!invitationCode.trim()) {
      setError("Please enter an invitation code");
      return;
    }
    setError("");
    // Static verification - redirect to new-organisation for now
    router.push("/new-organisation");
  };

  const handleCreateNew = () => {
    // Redirect to verify-invite page for organisation creation
    router.push("/verify-invite");
  };

  const handleBackToLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView("phone");
      setInvitationCode("");
      setError("");
      setIsTransitioning(false);
    }, 150);
  };

  // Clear error when switching views
  useEffect(() => {
    setError("");
  }, [currentView]);

  return (
    <div className="w-full max-w-md animate-fade-in">
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
        <h2 className="text-3xl font-bold text-slate-900 mb-2.5 tracking-tight">
          {currentView === "invitation" ? "Create Account" : 
           otpSent ? "Enter Code" : "Welcome back"}
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          {currentView === "invitation" 
            ? "Enter your invitation code to get started" 
            : otpSent 
              ? "We've sent a verification code to your phone" 
              : "Sign in with your phone number to continue"}
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
      <div className={`space-y-6 transition-all duration-200 ${isTransitioning ? 'opacity-0 transform -translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
        {currentView === "invitation" ? (
          <>
            {/* Invitation Code Input */}
            <div className="form-field">
              <label htmlFor="invitation" className="form-label" style={{ color: '#334155' }}>Invitation Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-(--text-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }}
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBackToLogin}
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
          </>
        ) : !otpSent ? (
          <>
            <PhoneInput value={phone} onChange={setPhone} disabled={isLoading} />
            
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={!phone.trim() || isLoading}
              className="premium-button-primary"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="premium-spinner"></span>
                  Sending OTP...
                </span>
              ) : (
                "Send OTP"
              )}
            </button>
          </>
        ) : (
          <>
            <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                className="premium-button-secondary flex-1"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || isLoading}
                className="premium-button-primary flex-1"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="premium-spinner"></span>
                    Verifying...
                  </span>
                ) : (
                  "Verify & Sign In"
                )}
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
              }}
              className="w-full text-center text-sm text-(--text-muted) hover:text-(--text-primary) transition-colors duration-200"
            >
              Didn't receive the code?{' '}
              <span className="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                Resend
              </span>
            </button>
          </>
        )}
      </div>

      {/* Footer - Create New CTA */}
      {currentView === "phone" && (
        <div className="mt-8 text-center">
          <p className="text-slate-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={handleCreateNew}
              className="text-violet-600 font-semibold hover:text-violet-700 transition-colors duration-200"
            >
              Create New
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
