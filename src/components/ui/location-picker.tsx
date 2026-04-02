/**
 * LocationPicker - Google Maps widget for selecting latitude/longitude.
 *
 * Props:
 *   latitude, longitude  – current coordinate strings ("" when unset)
 *   onLatitudeChange / onLongitudeChange – callbacks that receive the new
 *       string values whenever the user clicks the map or drags the marker.
 *   error / errorMessage – validation state forwarded from the parent form.
 *
 * The component dynamically loads the Google Maps JavaScript API the first
 * time it mounts.  If the API key is missing or the script fails to load,
 * two plain <input> fields are rendered as a graceful fallback so the form
 * remains submittable.
 *
 * Environment variable required:
 *   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  – a valid Google Maps JavaScript API key
 */

"use client";

import { useRef, useEffect, useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Minimal types – avoids needing @types/google.maps as a dependency */
/* ------------------------------------------------------------------ */
interface GoogleMap {
  setCenter(pos: { lat: number; lng: number }): void;
  setZoom(z: number): void;
  addListener(event: string, handler: (...args: unknown[]) => void): void;
}

interface GoogleMarker {
  setPosition(pos: { lat: number; lng: number }): void;
  getPosition(): { lat(): number; lng(): number } | null;
  setMap(map: GoogleMap | null): void;
  setDraggable(flag: boolean): void;
  addListener(event: string, handler: (...args: unknown[]) => void): void;
}

interface GoogleMapsNS {
  Map: new (
    el: HTMLElement,
    opts: { center: { lat: number; lng: number }; zoom: number; mapTypeControl?: boolean; streetViewControl?: boolean; fullscreenControl?: boolean }
  ) => GoogleMap;
  Marker: new (
    opts: { position: { lat: number; lng: number }; map: GoogleMap; draggable?: boolean; animation?: number }
  ) => GoogleMarker;
  LatLng: new (lat: number, lng: number) => { lat(): number; lng(): number };
  event: {
    clearInstanceListeners(obj: unknown): void;
  };
}

/* ------------------------------------------------------------------ */
/*  Script loader (singleton, safe for concurrent mounts)              */
/* ------------------------------------------------------------------ */
let loadPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    // Already loaded (e.g. HMR or another page)
    const w = window as unknown as Record<string, unknown>;
    if (w.google && (w.google as Record<string, unknown>).maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null; // allow retry on next mount
      reject(new Error("Failed to load Google Maps JavaScript API"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/* ------------------------------------------------------------------ */
/*  Fallback inputs (shown when Maps API is unavailable)              */
/* ------------------------------------------------------------------ */
function FallbackInputs({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  errors,
}: {
  latitude: string;
  longitude: string;
  onLatitudeChange: (v: string) => void;
  onLongitudeChange: (v: string) => void;
  errors: { latitude?: string; longitude?: string };
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-(--text-muted)">
        Map unavailable &mdash; enter coordinates manually.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-(--text-primary) mb-1">
            Latitude <span className="text-red-500">*</span>
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => onLatitudeChange(e.target.value)}
            placeholder="40.7127753"
            className={`w-full px-3 py-2 rounded-lg border text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 transition-all placeholder:text-(--text-muted) ${
              errors.latitude ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-(--border-primary) focus:ring-emerald-500/20 focus:border-emerald-500"
            }`}
          />
          {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-(--text-primary) mb-1">
            Longitude <span className="text-red-500">*</span>
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => onLongitudeChange(e.target.value)}
            placeholder="-74.0059728"
            className={`w-full px-3 py-2 rounded-lg border text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 transition-all placeholder:text-(--text-muted) ${
              errors.longitude ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-(--border-primary) focus:ring-emerald-500/20 focus:border-emerald-500"
            }`}
          />
          {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  errors?: { latitude?: string; longitude?: string };
}

const DEFAULT_CENTER = { lat: 40.7127753, lng: -74.0059728 }; // New York
const DEFAULT_ZOOM = 12;

export function LocationPicker({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  errors = {},
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<GoogleMap | null>(null);
  const markerInstance = useRef<GoogleMarker | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  /* ---- Load the Maps script on mount ---- */
  useEffect(() => {
    if (!apiKey) {
      setLoadError(true);
      return;
    }
    loadGoogleMaps(apiKey)
      .then(() => setMapsReady(true))
      .catch(() => setLoadError(true));
  }, [apiKey]);

  /* ---- Helper: read a LatLng from the Maps event ---- */
  const extractLatLng = useCallback(
    (latLng: unknown) => {
      const gmaps = (window as unknown as Record<string, unknown>).google as
        | Record<string, unknown>
        | undefined;
      const maps = gmaps?.maps as GoogleMapsNS | undefined;
      if (maps && latLng instanceof maps.LatLng) {
        return { lat: latLng.lat(), lng: latLng.lng() };
      }
      // Fallback duck-typing
      const ll = latLng as { lat(): number; lng(): number };
      if (typeof ll.lat === "function" && typeof ll.lng === "function") {
        return { lat: ll.lat(), lng: ll.lng() };
      }
      return null;
    },
    [],
  );

  /* ---- Initialise map once the script is ready ---- */
  useEffect(() => {
    if (!mapsReady || !mapRef.current) return;

    const gmaps = (window as unknown as Record<string, unknown>).google as
      | Record<string, unknown>
      | undefined;
    const maps = gmaps?.maps as GoogleMapsNS | undefined;
    if (!maps) return;

    const hasCoords = latitude && longitude;
    const center = hasCoords
      ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
      : DEFAULT_CENTER;
    const zoom = hasCoords ? 15 : DEFAULT_ZOOM;

    const map = new maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstance.current = map;

    const marker = new maps.Marker({
      position: center,
      map,
      draggable: true,
    });
    markerInstance.current = marker;

    // Click on map → move marker & update coords
    map.addListener("click", (e: unknown) => {
      const pos = extractLatLng(e);
      if (!pos) return;
      marker.setPosition(pos);
      onLatitudeChange(pos.lat.toFixed(8));
      onLongitudeChange(pos.lng.toFixed(8));
    });

    // Drag end → update coords
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (!pos) return;
      const ll = extractLatLng(pos);
      if (!ll) return;
      onLatitudeChange(ll.lat.toFixed(8));
      onLongitudeChange(ll.lng.toFixed(8));
    });

    // Cleanup on unmount
    return () => {
      maps.event.clearInstanceListeners(map);
      maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
      mapInstance.current = null;
      markerInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady]);

  /* ---- When editing: re-centre map if coords change externally ---- */
  useEffect(() => {
    if (!mapsReady) return;
    const map = mapInstance.current;
    const marker = markerInstance.current;
    if (!map || !marker) return;
    if (!latitude || !longitude) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    map.setCenter({ lat, lng });
    map.setZoom(15);
    marker.setPosition({ lat, lng });
  }, [mapsReady, latitude, longitude]);

  /* ---- Render ---- */
  if (loadError) {
    return (
      <FallbackInputs
        latitude={latitude}
        longitude={longitude}
        onLatitudeChange={onLatitudeChange}
        onLongitudeChange={onLongitudeChange}
        errors={errors}
      />
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-(--text-primary)">
        Location <span className="text-red-500">*</span>
      </label>
      {(!latitude || !longitude) && (
        <p className="text-xs text-(--text-muted)">
          Click the map to place a marker, then drag to refine.
        </p>
      )}
      {latitude && longitude && (
        <p className="text-xs text-(--text-secondary)">
          Lat: {latitude}, Lng: {longitude}
        </p>
      )}
      {(errors.latitude || errors.longitude) && (
        <p className="text-red-500 text-xs">
          {errors.latitude || errors.longitude}
        </p>
      )}
      <div
        ref={mapRef}
        className="w-full h-64 rounded-lg border border-(--border-primary) bg-(--bg-tertiary)"
        aria-label="Google Map for selecting branch location"
      />
    </div>
  );
}

export default LocationPicker;
