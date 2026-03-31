"use client";

import { useState, useRef, useEffect } from "react";
import { CountryCode, countryCodes } from "@/utils/CountryCode";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes.find(c => c.code === "IN") || countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const matchedCountry = countryCodes.find((country) =>
        value.startsWith(country.dialCode)
      );
      
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setPhoneNumber(value.slice(matchedCountry.dialCode.length).trim());
      } else {
        setPhoneNumber(value);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery("");
    
    const trimmedPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
    const dialCodeWithoutPlus = country.dialCode.replace("+", "");
    const combinedValue = `${dialCodeWithoutPlus}${trimmedPhone}`;
    onChange(combinedValue);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    const sanitizedValue = inputValue.replace(/[^\d\s\-\(\)]/g, "");
    setPhoneNumber(sanitizedValue);
    
    const trimmedPhone = sanitizedValue.replace(/[\s\-\(\)]/g, "");
    const dialCodeWithoutPlus = selectedCountry.dialCode.replace("+", "");
    const combinedValue = `${dialCodeWithoutPlus}${trimmedPhone}`;
    onChange(combinedValue);
  };

  const filteredCountries = countryCodes.filter(
    (country) =>
      country.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  return (
    <div className="form-field">
      <label htmlFor="phone" className="form-label" style={{ color: '#334155' }}>Phone Number</label>
      <div className="relative">
        <div className="flex">
          {/* Country Code Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={disabled}
              className="flex items-center gap-2 px-3 py-2.5 border border-r-0 border-[#e2e8f0] rounded-l-lg bg-[#f8fafc] text-[#1e293b] hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minWidth: "100px" }}
            >
              <span className="text-lg text-gray-400">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white border border-[#e2e8f0] rounded-lg shadow-xl overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b border-[#e2e8f0]">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search country or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-md focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/20"
                  />
                </div>

                {/* Country List */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-[#f1f5f9] transition-colors ${
                          selectedCountry.code === country.code ? "bg-[#f5f3ff]" : ""
                        }`}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-[#1e293b]">{country.country}</div>
                          <div className="text-xs text-[#64748b]">{country.dialCode}</div>
                        </div>
                        {selectedCountry.code === country.code && (
                          <svg className="w-4 h-4 text-[#8b5cf6]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-center text-[#64748b]">No countries found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <input
            id="phone"
            type="tel"
            placeholder="234 567 8900"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            disabled={disabled}
            className="flex-1 px-4 py-2.5 border border-[#e2e8f0] rounded-r-lg bg-white text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
      <p className="text-sm text-slate-500 mt-1.5">We'll send a verification code to {phoneNumber && selectedCountry.dialCode}{phoneNumber || " your number"}</p>
    </div>
  );
}
