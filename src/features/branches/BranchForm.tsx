"use client";

import type { Employee } from "@/types/employee";
import type { BranchStatus } from "@/types/branch";
import StatusRadio from "./components/StatusRadio";
import type { Branch, BranchPayload } from "@/types/branch";
import { LocationPicker } from "@/components/ui/location-picker";
import { useState, useEffect, useRef, useCallback } from "react";
import { lookupPostalCode } from "@/services/postal-code.service";
import { HeadquartersRadio } from "./components/HeadquartersRadio";
import { getOrganizationEmployees } from "@/services/employee.service";
import { Building2, User, Globe, IdCard, MapPinHouse, MapPinned, Phone, Mail } from "lucide-react";
import { BranchFormHeader, FormSection, FormActions, FloatingLabelInput, FloatingEmailInput, FloatingPhoneInput, FloatingSearchableDropdown } from "./components";

interface BranchFormProps {
  initialData?: Branch | null;
  onSubmit: (payload: BranchPayload) => Promise<void>;
  loading?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

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
  const [isLookingUpPostalCode, setIsLookingUpPostalCode] = useState(false);
  const postalCodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performPostalCodeLookup = useCallback(async (code: string) => {
    if (!code || code.length < 2) {
      return;
    }

    setIsLookingUpPostalCode(true);
    try {
      const result = await lookupPostalCode(code);
      if (result) {
        setCity(result.city);
        setState(result.state);
        setCountry(result.country);
      }
    } catch (error) {
      console.error("Failed to lookup postal code:", error);
    } finally {
      setIsLookingUpPostalCode(false);
    }
  }, []);

  const handlePostalCodeChange = useCallback((value: string) => {
    setPostalCode(value);

    if (postalCodeTimeoutRef.current) {
      clearTimeout(postalCodeTimeoutRef.current);
    }

    postalCodeTimeoutRef.current = setTimeout(() => {
      performPostalCodeLookup(value);
    }, 500);
  }, [performPostalCodeLookup]);

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

  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.length > 100) newErrors.name = "Name must be 100 characters or less";
    if (code.length > 50) newErrors.code = "Code must be 50 characters or less";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (!country.trim()) newErrors.country = "Country is required";
    if (!postalCode.trim()) newErrors.postalCode = "Postal Code is required";
    if (!latitude.trim()) newErrors.latitude = "Latitude is required";
    if (!longitude.trim()) newErrors.longitude = "Longitude is required";
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) newErrors.latitude = "Latitude must be between -90 and 90";
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) newErrors.longitude = "Longitude must be between -180 and 180";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format";
    if (!managerId) newErrors.managerId = "Manager is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: BranchPayload = {
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      postalCode: postalCode.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      isHeadquarters: isHeadquarters,
      status: status,
      managerId: typeof managerId === 'number' ? managerId : Number(managerId),
    };
    if (code.trim()) payload.code = code.trim();
    if (phone.trim()) payload.phone = phone.trim();
    if (email.trim()) payload.email = email.trim();
    await onSubmit(payload);
  };

  const managerOptions = employees.map((emp) => emp.id);

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

      <form onSubmit={handleSubmit} className="flex flex-col bg-(--bg-card) min-h-[83vh] rounded-xl border border-(--border-primary) shadow-sm overflow-hidden p-5">
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-7">
          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FloatingLabelInput id="branch-name" label="Branch Name" value={name} onChange={setName} required error={errors.name} icon={<Building2 className="h-4 w-4" />}/>
              <FloatingLabelInput id="branch-code" label="Branch Code" value={code} onChange={setCode} error={errors.code} icon={<IdCard className="h-4 w-4" />}/>
              <FloatingSearchableDropdown<number> id="branch-manager" label="Branch Manager" value={managerId} onChange={setManagerId} options={managerOptions} loading={employeesLoading} error={errors.managerId || employeesError} getDisplayValue={getEmployeeDisplay} getSearchValue={getEmployeeSearch} icon={<User className="h-4 w-4" />} required/>
            </div>
          </FormSection>

          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingPhoneInput id="phone" label="Phone" value={phone} onChange={setPhone} icon={<Phone className="h-4 w-4" />}/>
              <FloatingEmailInput id="email" label="Email" value={email} onChange={setEmail} error={errors.email} icon={<Mail className="h-4 w-4" />}/>
            </div>
          </FormSection>
          <FormSection>
            <FloatingLabelInput id="street-address" label="Street Address" value={address} onChange={setAddress} required error={errors.address} icon={<MapPinHouse className="h-4 w-4" />}/>
          </FormSection>

          <FormSection className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LocationPicker latitude={latitude} longitude={longitude} onLatitudeChange={setLatitude} onLongitudeChange={setLongitude} error={!!errors.latitude || !!errors.longitude} errorMessage={errors.latitude || errors.longitude}/>
              <FloatingLabelInput id="pin-code" label="Pin Code" value={postalCode} onChange={handlePostalCodeChange} disabled={isLookingUpPostalCode} required error={errors.postalCode} icon={<MapPinned className="h-4 w-4" />}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FloatingLabelInput id="city" label="City" value={city} onChange={setCity} required error={errors.city} icon={<Globe className="h-4 w-4" />}/>
              <FloatingLabelInput id="state" label="State" value={state} onChange={setState} required error={errors.state} icon={<Globe className="h-4 w-4" />}/>
              <FloatingLabelInput id="country" label="Country" value={country} onChange={setCountry} required error={errors.country} icon={<Globe className="h-4 w-4" />}/>
            </div>
          </FormSection>

          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-4">
                <HeadquartersRadio isHeadquarters={isHeadquarters} onToggle={() => setIsHeadquarters(!isHeadquarters)} statusValue={status}/>
              </div>
              <div className="col-span-8">
                <StatusRadio status={status} onChange={(value) => setStatus(value)} headquartersValue={isHeadquarters}/>
              </div>
            </div>
          </FormSection>
        </div>

        <div className="shrink-0 pt-4">
          <FormActions loading={loading} onCancel={handleCancel} isEdit={!!initialData}/>
        </div>
      </form>
    </div>
  );
}

export default BranchForm;