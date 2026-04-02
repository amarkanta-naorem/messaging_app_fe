"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationPicker } from "@/components/ui/location-picker";
import type { Branch, BranchPayload } from "@/types/branch";
import type { BranchStatus } from "@/types/branch";

interface BranchFormProps {
  initialData?: Branch | null;
  onSubmit: (payload: BranchPayload) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS: BranchStatus[] = ["active", "inactive", "closed"];

export function BranchForm({ initialData, onSubmit, onCancel, loading = false }: BranchFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isHeadquarters, setIsHeadquarters] = useState(false);
  const [status, setStatus] = useState<BranchStatus>("active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCode(initialData.code || "");
      setAddress(initialData.address || "");
      setCity(initialData.city || "");
      setState(initialData.state || "");
      setCountry(initialData.country || "");
      setPostalCode(initialData.postalCode || "");
      setPhone(initialData.phone || "");
      setEmail(initialData.email || "");
      setLatitude(initialData.latitude || "");
      setLongitude(initialData.longitude || "");
      setIsHeadquarters(initialData.isHeadquarters);
      setStatus(initialData.status);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.length > 100) newErrors.name = "Name must be 100 characters or less";
    if (code.length > 50) newErrors.code = "Code must be 50 characters or less";
    if (!latitude.trim()) newErrors.latitude = "Latitude is required";
    if (!longitude.trim()) newErrors.longitude = "Longitude is required";
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) newErrors.latitude = "Latitude must be between -90 and 90";
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) newErrors.longitude = "Longitude must be between -180 and 180";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: BranchPayload = {
      name: name.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
    if (code.trim()) payload.code = code.trim();
    if (address.trim()) payload.address = address.trim();
    if (city.trim()) payload.city = city.trim();
    if (state.trim()) payload.state = state.trim();
    if (country.trim()) payload.country = country.trim();
    if (postalCode.trim()) payload.postalCode = postalCode.trim();
    if (phone.trim()) payload.phone = phone.trim();
    if (email.trim()) payload.email = email.trim();
    payload.isHeadquarters = isHeadquarters;
    payload.status = status;
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required error={!!errors.name} errorMessage={errors.name} placeholder="Main Office" />
      <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} error={!!errors.code} errorMessage={errors.code} placeholder="HQ-001" />
      <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Business Park" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" />
        <Input label="State" value={state} onChange={(e) => setState(e.target.value)} placeholder="NY" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="USA" />
        <Input label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="10001" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!errors.email} errorMessage={errors.email} placeholder="office@example.com" />
      </div>
      <LocationPicker
        latitude={latitude}
        longitude={longitude}
        onLatitudeChange={setLatitude}
        onLongitudeChange={setLongitude}
        error={!!errors.latitude || !!errors.longitude}
        errorMessage={errors.latitude || errors.longitude}
      />

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isHeadquarters}
            onChange={(e) => setIsHeadquarters(e.target.checked)}
            className="w-4 h-4 rounded border-(--border-primary) text-(--accent-primary) focus:ring-(--accent-primary)"
          />
          <span className="text-sm text-(--text-primary)">Is Headquarters</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-(--text-primary) mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BranchStatus)}
          className="w-full px-3 py-2 rounded-lg border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border-primary)">
        <Button variant="secondary" size="md" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" size="md" type="submit" loading={loading}>
          {initialData ? "Update Branch" : "Create Branch"}
        </Button>
      </div>
    </form>
  );
}

export default BranchForm;
