"use client";

import { useState, useEffect } from "react";
import type { Employee } from "@/types/employee";
import type { BranchStatus } from "@/types/branch";
import { Building2, Check, User } from "lucide-react";
import type { Branch, BranchPayload } from "@/types/branch";
import { LocationPicker } from "@/components/ui/location-picker";
import { getOrganizationEmployees } from "@/services/employee.service";
import { BranchFormHeader, FormSection, InputField, SearchableDropdown, LocationFields, HeadquartersToggle, FormActions } from "./components";

interface BranchFormProps {
  initialData?: Branch | null;
  onSubmit: (payload: BranchPayload) => Promise<void>;
  loading?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: BranchStatus[] = ["active", "inactive", "closed"];

export function BranchForm({ initialData, onSubmit, loading = false, isOpen, onClose }: BranchFormProps) {
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
  const [managerId, setManagerId] = useState<number | "">("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState("");
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
      setManagerId(initialData.managerId ?? "");
    } else if (isOpen) {
      setName("");
      setCode("");
      setAddress("");
      setCity("");
      setState("");
      setCountry("");
      setPostalCode("");
      setPhone("");
      setEmail("");
      setLatitude("");
      setLongitude("");
      setIsHeadquarters(false);
      setStatus("active");
      setManagerId("");
    }
  }, [initialData, isOpen]);

  // Fetch employees for manager dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);
        setEmployeesError("");
        const data = await getOrganizationEmployees();
        setEmployees(data);
      } catch {
        setEmployeesError("Failed to load employees");
      } finally {
        setEmployeesLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Early return if form is not open
  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
  };

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
    if (managerId) payload.managerId = managerId;
    await onSubmit(payload);
  };

  const managerOptions = employees.map((emp) => emp.id);
  const statusOptions = STATUS_OPTIONS;

  const getEmployeeDisplay = (id: number) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.name : "";
  };

  const getEmployeeSearch = (id: number) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.name.toLowerCase() : "";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <BranchFormHeader initialData={initialData} onClose={onClose} />

      <form onSubmit={handleSubmit} className="space-y-4 bg-(--bg-card) max-h-[84vh] overflow-y-auto custom-scrollbar rounded-xl border border-(--border-primary) shadow-sm overflow-hidden p-5">
        <FormSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Branch Name"
              value={name}
              onChange={setName}
              placeholder="Main Office"
              required
              error={errors.name}
              icon={<Building2 className="h-4 w-4" />}
            />
            <InputField
              label="Branch Code"
              value={code}
              onChange={setCode}
              placeholder="HQ-001"
              error={errors.code}
              icon={<Building2 className="h-4 w-4" />}
            />
            <SearchableDropdown<number>
              label="Branch Manager"
              value={managerId}
              onChange={setManagerId}
              options={managerOptions}
              placeholder="Select manager"
              loading={employeesLoading}
              error={!!employeesError}
              errorMessage={employeesError}
              getDisplayValue={getEmployeeDisplay}
              getSearchValue={getEmployeeSearch}
              icon={<User className="h-4 w-4" />}
            />
          </div>
        </FormSection>

        <FormSection>
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            error={!!errors.latitude || !!errors.longitude}
            errorMessage={errors.latitude || errors.longitude}
          />
        </FormSection>

        <LocationFields
          address={address}
          onAddressChange={setAddress}
          city={city}
          onCityChange={setCity}
          state={state}
          onStateChange={setState}
          country={country}
          onCountryChange={setCountry}
          postalCode={postalCode}
          onPostalCodeChange={setPostalCode}
          phone={phone}
          onPhoneChange={setPhone}
          email={email}
          onEmailChange={setEmail}
          emailError={errors.email}
        />

        <FormSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HeadquartersToggle
              isHeadquarters={isHeadquarters}
              onToggle={() => setIsHeadquarters(!isHeadquarters)}
            />
            <SearchableDropdown<BranchStatus>
              label="Status"
              value={status}
              onChange={setStatus}
              options={statusOptions}
              getDisplayValue={(s) => {
                const display = s.charAt(0).toUpperCase() + s.slice(1);
                return display;
              }}
              getSearchValue={(s) => s.toLowerCase()}
              icon={<Check className="h-4 w-4" />}
            />
          </div>
        </FormSection>

        <FormActions
          loading={loading}
          onCancel={handleCancel}
          isEdit={!!initialData}
        />
      </form>
    </div>
  );
}

export default BranchForm;