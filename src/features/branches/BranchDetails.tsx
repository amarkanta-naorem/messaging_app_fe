"use client";

import { Branch } from "@/types/branch";
import { X, MapPin, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface BranchDetailsProps {
  branch: Branch | null;
  isOpen: boolean;
  onClose: () => void;
}

interface GMap {
  setCenter(pos: { lat: number; lng: number }): void;
  panTo(pos: { lat: number; lng: number }): void;
  setZoom(zoom: number): void;
  setMapTypeId(id: string): void;
}

interface GMarker {
  setMap(map: GMap | null): void;
}

interface GMapsNS {
  Map: new (el: HTMLElement, options: {
    center: { lat: number; lng: number };
    zoom: number;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    streetViewControl?: boolean;
    mapTypeControl?: boolean;
  }) => GMap;
  Marker: new (opts: { position: { lat: number; lng: number }; map: GMap }) => GMarker;
}

function getGMaps(): GMapsNS | null {
  const w = window as unknown as Record<string, unknown>;
  return ((w.google as Record<string, unknown> | undefined)?.maps as GMapsNS) || null;
}

export function BranchDetails({ branch, isOpen, onClose }: BranchDetailsProps) {
  const [mapsReady, setMapsReady] = useState(false);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GMap | null>(null);
  const markerRef = useRef<GMarker | null>(null);

  useEffect(() => {
    if (!isOpen || !branch) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const loadGoogleMaps = () => {
      return new Promise<void>((resolve, reject) => {
        const w = window as unknown as Record<string, unknown>;
        if (w.google && (w.google as Record<string, unknown>).maps) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        const callbackName = `googleMapsCallback_${Date.now()}`;
        (w as Record<string, unknown>)[callbackName] = () => {
          resolve();
        };
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error("Failed to load Google Maps"));
        document.head.appendChild(script);
      });
    };

    loadGoogleMaps().then(() => {
      const gmaps = getGMaps();
      if (!gmaps || !mapDivRef.current) {
        setMapsReady(false);
        return;
      }
      const lat = parseFloat(branch.latitude || "0");
      const lng = parseFloat(branch.longitude || "0");
      const center = { lat: isNaN(lat) ? 0 : lat, lng: isNaN(lng) ? 0 : lng };
      const map = new gmaps.Map(mapDivRef.current, {
        center,
        zoom: 15,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      });
      mapRef.current = map;
      new gmaps.Marker({ position: center, map });
      markerRef.current = markerRef.current || { setMap: () => {} };
      setMapsReady(true);
    })
    .catch(() => {
      setMapsReady(false);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, [isOpen, branch]);

  if (!isOpen || !branch) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Branch Details</h1>
          <p className="text-(--text-secondary)">Viewing information for {branch.name}</p>
        </div>
        <button type="button" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover] transition-all duration-200 cursor-pointer text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to data table
        </button>
      </div>

      {/* Details Card */}
      <div className="bg-(--bg-card) max-h-[84vh] overflow-y-auto custom-scrollbar rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Name" value={branch.name} />
              <DetailRow label="Code" value={branch.code} />
              <DetailRow label="Phone" value={branch.phone} />
              <DetailRow label="Email" value={branch.email} />
              <StatusBadge status={branch.status || ""} />
              <HeadquartersBadge isHeadquarters={branch.isHeadquarters} />
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-(--accent-primary)" />
                <span className="text-sm font-medium text-(--text-primary)">Location on Map</span>
              </div>
              <div ref={mapDivRef} className="w-full h-64 rounded-lg border border-(--border-primary) bg-(--bg-tertiary) overflow-hidden" style={{ minHeight: "256px" }}/>
              {!mapsReady && (
                <div className="mt-2 text-xs text-(--text-muted) text-center">
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "Loading map..." : "Map unavailable — configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to display location on map."}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between">
            <DetailRow label="Address" value={branch.address} />
            <DetailRow label="City" value={branch.city} />
            <DetailRow label="State" value={branch.state} />
            <DetailRow label="Country" value={branch.country} />
            <DetailRow label="Postal Code" value={branch.postalCode} />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-(--text-muted)">Branch Manager</span>
            <div className="flex items-start gap-4">
              <img src={branch.manager?.avatar ?? undefined} className="w-15 h-15 rounded-full" />
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-2xl text-(--text-primary)">{branch.manager?.name}</p>
                <div className="flex gap-2 text-(--text-muted) text-xs">
                  <p>{branch.manager?.phone}</p>
                  <p>|</p>
                  <p>{branch.manager?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    const s = status.toLowerCase();
    if (s === "active") {
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30";
    }
    if (s === "inactive") {
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30";
    }
    if (s === "closed") {
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30";
    }
  };

  return (
    <div className="bg-(--bg-secondary) rounded-lg p-4 border border-(--border-primary)">
      <span className="text-(--text-muted) text-sm block mb-2">Status</span>
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${getStatusStyles()}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status.toLowerCase() === "active" ? "bg-linear-to-r from-emerald-500/20 to-emerald-600/20" : status.toLowerCase() === "inactive" ? "bg-linear-to-r from-amber-500/20 to-amber-600/20" : status.toLowerCase() === "closed" ? "bg-linear-to-r from-rose-500/20 to-rose-600/20" : "bg-slate-500"}`} />
        {status}
      </span>
    </div>
  );
}

function HeadquartersBadge({ isHeadquarters }: { isHeadquarters: boolean }) {
  return (
    <div className="bg-(--bg-secondary) rounded-lg p-4 border border-(--border-primary)">
      <span className="text-(--text-muted) text-sm block mb-2">Location Type</span>
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
        isHeadquarters 
          ? "bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800 dark:text-violet-400" 
          : "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800 dark:text-slate-400"
      }`}>
        <MapPin className={`w-3 h-3 ${isHeadquarters ? "text-violet-500" : "text-slate-400"}`} />
        {isHeadquarters ? "Headquarter" : "Branch"}
      </span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="bg-(--bg-secondary) rounded-lg p-4">
      <span className="text-(--text-muted) text-sm block mb-1">{label}</span>
      <span className="text-(--text-primary) text-sm font-medium">{value || "-"}</span>
    </div>
  );
}

export default BranchDetails;