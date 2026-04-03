"use client";

import { InputField } from "./InputField";
import { FormSection } from "./FormSection";
import { LocationInput } from "./LocationInput";
import { useState, useEffect, useRef, useCallback } from "react";
import { lookupPostalCode } from "@/services/postal-code.service";
import { Globe, Loader2, AlertCircle, Pencil, Lock } from "lucide-react";

interface LocationFieldsProps {
  address: string;
  onAddressChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  state: string;
  onStateChange: (value: string) => void;
  country: string;
  onCountryChange: (value: string) => void;
  postalCode: string;
  onPostalCodeChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  emailError?: string;
}

export function LocationFields({ address, onAddressChange, city, onCityChange, state, onStateChange, country, onCountryChange, postalCode, onPostalCodeChange, phone, onPhoneChange, email, onEmailChange, emailError }: LocationFieldsProps) {
  const [locationLocked, setLocationLocked] = useState(true);
  const [postalLoading, setPostalLoading] = useState(false);
  const [postalError, setPostalError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const lookupPostalCodeDebounced = useCallback(async (code: string) => {
    if (!code || code.length < 2) {
      onCityChange("");
      onStateChange("");
      onCountryChange("");
      setPostalError(null);
      setLocationLocked(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setPostalLoading(true);
    setPostalError(null);

    try {
      const result = await lookupPostalCode(code);
      
      if (result) {
        onCityChange(result.city);
        onStateChange(result.state);
        onCountryChange(result.country);
        setPostalError(null);
        setLocationLocked(true);
      } else {
        onCityChange("");
        onStateChange("");
        onCountryChange("");
        setPostalError("Postal code not found. You can enter manually.");
        setLocationLocked(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      onCityChange("");
      onStateChange("");
      onCountryChange("");
      setPostalError("Failed to lookup postal code. You can enter manually.");
      setLocationLocked(false);
    } finally {
      setPostalLoading(false);
    }
  }, [onCityChange, onStateChange, onCountryChange]);

  const handlePostalCodeChange = useCallback(
    (value: string) => {
      onPostalCodeChange(value);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (!value || value.length < 2) {
        onCityChange("");
        onStateChange("");
        onCountryChange("");
        setPostalError(null);
        setLocationLocked(false);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        return;
      }

      debounceTimeoutRef.current = setTimeout(() => {
        lookupPostalCodeDebounced(value);
      }, 500);
    },
    [onPostalCodeChange, lookupPostalCodeDebounced, onCityChange, onStateChange, onCountryChange]
  );

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <FormSection>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-1">
          <label className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
            <Globe className="h-4 w-4 text-(--text-muted)" />
            Street Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="123 Business Park, Suite 100"
            className="w-full px-4 py-3 rounded-xl border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/20 focus:border-(--accent-primary) transition-all duration-200 hover:border-(--border-secondary)"
          />
        </div>
        <div className="md:col-span-1">
          <div className="relative">
            <InputField
              label="PIN Code"
              value={postalCode}
              onChange={handlePostalCodeChange}
              placeholder="10001, SW1A 1AA"
              icon={<Globe className="h-4 w-4" />}
            />
            {postalLoading && (
              <div className="absolute right-10 top-9 -translate-y-1/2">
                <Loader2 className="h-4 w-4 text-(--color-warning) animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 my-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
            <Globe className="h-4 w-4 text-(--text-muted)" />
            City, State & Country
          </label>
          <div className="flex items-center gap-2">
            {locationLocked && (postalError || postalLoading) && (
              <button type="button" onClick={() => setLocationLocked(false)} className="flex items-center gap-1.5 text-xs font-medium text-(--color-warning) hover:opacity-80 transition-colors px-2 py-1 rounded-lg hover:bg-(--color-warning)/10">
                <Pencil className="h-3 w-3" />
                Edit manually
              </button>
            )}
            {!locationLocked && (city || state || country) && (
              <button type="button" onClick={() => setLocationLocked(true)} className="flex items-center gap-1.5 text-xs font-medium text-(--accent-primary) hover:opacity-80 transition-colors px-2 py-1 rounded-lg hover:bg-(--accent-primary)/10">
                <Lock className="h-3 w-3" />
                Lock auto-fill
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <LocationInput locationLocked={locationLocked} postalLoading={postalLoading} value={city} onChange={onCityChange} placeholder="Enter city"/>
          <LocationInput locationLocked={locationLocked} postalLoading={postalLoading} value={state} onChange={onStateChange} placeholder="Enter state"/>
          <LocationInput locationLocked={locationLocked} postalLoading={postalLoading} value={country} onChange={onCountryChange} placeholder="Enter country"/>
        </div>
        
        {postalError && (
          <div className="flex items-start gap-2 mt-2 text-sm text-(--color-warning) bg-(--color-warning)/10 px-4 py-3 rounded-xl border border-(--color-warning)/20">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="flex-1">{postalError}</span>
            {!locationLocked && (
              <button type="button" onClick={() => setLocationLocked(true)} className="text-xs font-semibold hover:underline whitespace-nowrap">Reset</button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <InputField
            label="Phone"
            value={phone}
            onChange={onPhoneChange}
            placeholder="+1 234 567 890"
            icon={<Globe className="h-4 w-4" />}
          />
          <InputField
            label="Email"
            value={email}
            onChange={onEmailChange}
            placeholder="office@example.com"
            type="email"
            error={emailError}
            icon={<Globe className="h-4 w-4" />}
          />
        </div>
      </div>
    </FormSection>
  );
}