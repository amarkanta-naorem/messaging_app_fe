"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendOtpNewOrganisation, verifyOtpNewOrganisation } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { createOrganisation, mapApiError } from "@/services/organisation.service";
import type { OrganisationPayload } from "@/types";

interface OrganisationFormState {
  name: string;
  logo: string;
}

const emptyFormState: OrganisationFormState = {
  name: "",
  logo: "",
};

export default function NewOrganisationForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [formState, setFormState] = useState<OrganisationFormState>(emptyFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phone & OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Clear error when user types
  useEffect(() => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.phone;
      delete newErrors.otp;
      return newErrors;
    });
  }, [phone, otp]);

  const handleRequestOtp = async () => {
    if (!phone.trim()) {
      setErrors((prev) => ({ ...prev, phone: "Phone number is required" }));
      return;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.phone;
      return newErrors;
    });
    setIsOtpLoading(true);
    try {
      await sendOtpNewOrganisation(phone);
      setOtpSent(true);
    } catch {
      setErrors((prev) => ({ ...prev, phone: "Failed to send OTP. Please try again." }));
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "Please enter the complete 6-digit code" }));
      return;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.otp;
      return newErrors;
    });
    setIsVerifying(true);
    try {
      const response = await verifyOtpNewOrganisation(phone, otp);
      // Use the login function from AuthContext to properly update Redux store
      await login(response.token, response.user);
      setIsPhoneVerified(true);
    } catch {
      setErrors((prev) => ({ ...prev, otp: "Invalid OTP. Please try again." }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (field: keyof OrganisationFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      handleChange("logo", file.name);
    }
  };

  const handleRemoveLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    handleChange("logo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!isPhoneVerified) {
      newErrors.phone = "Please verify your phone number";
    }
    if (!formState.name.trim()) {
      newErrors.name = "Organisation name is required";
    } else if (formState.name.length > 100) {
      newErrors.name = "Organisation name must be 100 characters or less";
    }
    if (formState.logo.trim() && formState.logo.length > 255) {
      newErrors.logo = "Logo URL must be 255 characters or less";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare the organisation payload
      const payload: OrganisationPayload = {
        name: formState.name.trim(),
        logo: formState.logo.trim() || null,
        bio: null, // bio is not in the form, can be added later
        status: "active",
      };

      // Call the createOrganisation API
      await createOrganisation(payload);
      
      // On success, redirect to dashboard or show success message
      router.push("/dashboard");
    } catch (error) {
      const apiError = mapApiError(error);
      setErrors((prev) => ({ 
        ...prev, 
        submit: apiError.message || "Failed to create organisation. Please try again." 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center min-h-screen px-4 py-8">
  {/* Simple header with soft gradient */}
  <div className="text-center mb-8">
    <h1 className="text-4xl text-gray-900 font-semibold">Create Organisation</h1>
    <p className="text-sm text-slate-600 mt-2">Set up your workspace in seconds</p>
  </div>

  {/* Error messages – still compact but with soft styling */}
  {(errors.phone || errors.otp || errors.submit) && (
    <div className="flex items-center gap-2 p-3 mb-5 bg-rose-50/80 backdrop-blur-sm border border-rose-200 rounded-2xl text-rose-600 text-sm shadow-sm">
      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <span>{errors.phone || errors.otp || errors.submit}</span>
    </div>
  )}

  {/* Glass card */}
  <div className="">
    <div className="space-y-6">
      {/* Phone number */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Phone <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <input
            type="tel"
            placeholder="+1 234 567 8900"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isOtpLoading || isPhoneVerified}
            className="w-full pl-11 pr-11 py-3 bg-slate-100/80 border border-gray-400 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all disabled:opacity-50"
          />
          {isPhoneVerified && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* OTP section */}
        {otpSent && !isPhoneVerified && (
          <div className="mt-5 pt-4 border-t border-slate-200/60 animate-fade-in">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
              Enter 6‑digit code
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index] || ""}
                  onChange={(e) => {
                    const digit = e.target.value;
                    if (!/^\d*$/.test(digit)) return;
                    const newOtp = otp.padEnd(6, "").split("");
                    newOtp[index] = digit.slice(-1);
                    setOtp(newOtp.join(""));
                    if (digit && index < 5) {
                      const inputs = document.querySelectorAll('.otp-input-modern');
                      (inputs[index + 1] as HTMLInputElement)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                      const inputs = document.querySelectorAll('.otp-input-modern');
                      (inputs[index - 1] as HTMLInputElement)?.focus();
                    }
                  }}
                  disabled={isVerifying}
                  className="otp-input-modern w-12 h-14 text-center text-2xl font-light text-slate-700 bg-slate-100/70 border border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-400/50 transition-all"
                  style={{ backgroundColor: otp[index] ? '#e0f2fe' : '#f1f5f9' }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifying || otp.length !== 6}
                className="flex-1 py-2.5 px-4 bg-linear-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-40 transition-all shadow-md shadow-blue-500/20"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying
                  </span>
                ) : (
                  "Verify"
                )}
              </button>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isOtpLoading}
                className="text-xs text-slate-400 underline underline-offset-2 hover:text-blue-500 disabled:opacity-40 transition-colors"
              >
                {isOtpLoading ? "Sending…" : "Resend"}
              </button>
            </div>
          </div>
        )}

        {/* Send OTP button */}
        {!otpSent && !isPhoneVerified && (
          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={isOtpLoading || !phone.trim()}
            className="w-full mt-4 py-2.5 px-4 bg-linear-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-40 transition-all shadow-md shadow-blue-500/20"
          >
            {isOtpLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending
              </span>
            ) : (
              "Send code"
            )}
          </button>
        )}
      </div>

      {/* Organisation name */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Organisation <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <input
            type="text"
            value={formState.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Your organisation name"
            maxLength={100}
            className="w-full pl-11 pr-4 py-3 bg-slate-100/80 border border-gray-400 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
          />
        </div>
        {errors.name && (
          <p className="text-rose-500 text-xs mt-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.name}
          </p>
        )}
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Logo <span className="font-normal text-slate-300">(optional)</span>
        </label>
        {logoPreview ? (
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm p-1">
              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute -top-2 -right-2 w-6 h-6 bg-rose-400 text-white rounded-full flex items-center justify-center hover:bg-rose-500 transition shadow-md"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-slate-300 rounded-2xl p-3 text-center bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              onChange={handleLogoChange}
            />
            <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-slate-500">Click to upload</p>
            <p className="text-xs text-slate-400 mt-1">JPG, JPEG or PNG</p>
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 transition-all shadow-lg shadow-blue-600/30 mt-4"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating...
          </span>
        ) : (
          "Create workspace"
        )}
      </button>
    </div>
  </div>

  {/* Footer */}
  <div className="mt-6 text-center">
    <p className="text-sm text-slate-400">
      Already have an account?{" "}
      <Link href="/login" className="text-blue-500 font-medium hover:text-blue-600 transition-colors">
        Sign in
      </Link>
    </p>
  </div>
</div>
  );
}
