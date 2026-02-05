"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "./PhoneInput";
import OtpInput from "./OtpInput";
import { sendOtp, verifyOtp } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
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
    if (otp.length !== 6 || !name.trim()) return;
    setError("");
    setIsLoading(true);
    try {
      const response = await verifyOtp(phone, otp, name);
      login(response.token, response.user);
      router.push("/");
    } catch {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-2">Welcome</h1>
      <p className="text-gray-600 text-center mb-8">Sign in with your phone number</p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <PhoneInput value={phone} onChange={setPhone} disabled={isLoading || otpSent} />

        <button
          type="button"
          onClick={handleRequestOtp}
          disabled={!phone.trim() || isLoading || otpSent}
          className="w-full py-3 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading && !otpSent ? "Sending..." : otpSent ? "OTP Sent" : "Send OTP"}
        </button>

        {otpSent && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium">Your Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />

            <button
              type="button"
              onClick={handleVerifyOtp}
              className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
