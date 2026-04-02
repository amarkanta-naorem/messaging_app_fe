/**
 * LocationPicker – single-input Google Maps coordinate picker.
 *
 * Renders ONE text input that displays "latitude,longitude".
 *   - Clicking the input opens a modal with a Google Map.
 *   - Search bar powered by Places Autocomplete to find locations.
 *   - Click the map or drag the marker to select coordinates.
 *   - Toggle between Roadmap and Satellite view.
 *   - Pressing "Confirm" writes the selected coordinates back.
 *   - If the Google Maps API fails to load, falls back to manual input.
 *
 * Environment variable:
 *   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 */

"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { MapPin, X, Loader2, Search, Satellite } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Minimal Google Maps types (avoids @types/google.maps dependency)   */
/* ------------------------------------------------------------------ */
interface LatLng {
  lat(): number;
  lng(): number;
}

interface GMap {
  setCenter(pos: { lat: number; lng: number }): void;
  setZoom(z: number): void;
  getZoom(): number;
  panTo(pos: { lat: number; lng: number }): void;
  setMapTypeId(id: string): void;
  addListener(event: string, handler: (...args: unknown[]) => void): void;
  controls: { index: number }[][] ;
}

interface GMarker {
  setPosition(pos: { lat: number; lng: number } | LatLng): void;
  getPosition(): LatLng | null;
  setMap(map: GMap | null): void;
  setVisible(visible: boolean): void;
  addListener(event: string, handler: (...args: unknown[]) => void): void;
}

interface GAutocomplete {
  addListener(event: string, handler: () => void): void;
  getPlace(): { geometry?: { location?: LatLng }; name?: string } | undefined;
  bindTo(arr: unknown[], map: GMap): void;
}

interface GMapsNS {
  Map: new (
    el: HTMLElement,
    opts: {
      center: { lat: number; lng: number };
      zoom: number;
      mapTypeControl: boolean;
      mapTypeControlOptions?: { style: number; position: number };
      streetViewControl: boolean;
      fullscreenControl: boolean;
      zoomControl: boolean;
    },
  ) => GMap;
  Marker: new (opts: {
    position: { lat: number; lng: number };
    map: GMap;
    draggable: boolean;
  }) => GMarker;
  LatLng: new (lat: number, lng: number) => LatLng;
  event: { clearInstanceListeners(obj: unknown): void };
  MapTypeControlStyle: { DROPDOWN_MENU: number };
  ControlPosition: { TOP_LEFT: number; TOP_RIGHT: number };
  MapTypeId: { ROADMAP: string; SATELLITE: string };
  places: {
    Autocomplete: new (
      input: HTMLInputElement,
      opts?: {
        fields?: string[];
        types?: string[];
      },
    ) => GAutocomplete;
  };
}

/* ------------------------------------------------------------------ */
/*  Singleton script loader                                            */
/* ------------------------------------------------------------------ */
let loadPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const w = window as unknown as Record<string, unknown>;
    if (w.google && (w.google as Record<string, unknown>).maps) {
      resolve();
      return;
    }
    const callbackName = "__gm_cb_" + Date.now();
    (w as Record<string, unknown>)[callbackName] = () => {
      delete (w as Record<string, unknown>)[callbackName];
      resolve();
    };
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => {
      delete (w as Record<string, unknown>)[callbackName];
      loadPromise = null;
      reject(new Error("Failed to load Google Maps JavaScript API"));
    };
    document.head.appendChild(s);
  });
  return loadPromise;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const DEFAULT_CENTER = { lat: 24.6637, lng: 93.8725 };
const DEFAULT_ZOOM = 10;

function compose(lat: string, lng: string): string {
  if (!lat || !lng) return "";
  return `${lat},${lng}`;
}

function parse(value: string): { lat: string; lng: string } | null {
  const parts = value.split(",");
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat: lat.toFixed(8), lng: lng.toFixed(8) };
}

function getGMaps(): GMapsNS | null {
  const w = window as unknown as Record<string, unknown>;
  return ((w.google as Record<string, unknown> | undefined)?.maps as GMapsNS) || null;
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
export interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onLatitudeChange: (v: string) => void;
  onLongitudeChange: (v: string) => void;
  error?: boolean;
  errorMessage?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function LocationPicker({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  error = false,
  errorMessage,
}: LocationPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [mapsReady, setMapsReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [mapsLoading, setMapsLoading] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [stagedLat, setStagedLat] = useState("");
  const [stagedLng, setStagedLng] = useState("");
  const [isSatellite, setIsSatellite] = useState(false);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<GMap | null>(null);
  const markerRef = useRef<GMarker | null>(null);
  const autocompleteRef = useRef<GAutocomplete | null>(null);

  /* ---- Preload the script (once, eagerly) ---- */
  useEffect(() => {
    if (!apiKey) {
      console.warn("[LocationPicker] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set.");
      setLoadFailed(true);
      return;
    }
    setMapsLoading(true);
    loadGoogleMaps(apiKey)
      .then(() => {
        setMapsReady(true);
        setMapsLoading(false);
      })
      .catch((err) => {
        console.error("[LocationPicker] Failed to load Google Maps:", err);
        setLoadFailed(true);
        setMapsLoading(false);
      });
  }, [apiKey]);

  /* ---- Compose the display value ---- */
  const displayValue = compose(latitude, longitude);

  /* ---- Open the picker modal ---- */
  const openPicker = useCallback(() => {
    setStagedLat(latitude || "");
    setStagedLng(longitude || "");
    setIsSatellite(false);
    setPickerOpen(true);
  }, [latitude, longitude]);

  /* ---- Initialise the map when the modal opens ---- */
  useEffect(() => {
    if (!pickerOpen || !mapsReady || !mapDivRef.current) return;

    const gmaps = getGMaps();
    if (!gmaps) {
      console.error("[LocationPicker] Google Maps object not found after script load.");
      setLoadFailed(true);
      setPickerOpen(false);
      return;
    }

    const hasCoords = stagedLat && stagedLng;
    const center = hasCoords
      ? { lat: parseFloat(stagedLat), lng: parseFloat(stagedLng) }
      : DEFAULT_CENTER;
    const zoom = hasCoords ? 15 : DEFAULT_ZOOM;

    const map = new gmaps.Map(mapDivRef.current, {
      center,
      zoom,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: gmaps.MapTypeControlStyle.DROPDOWN_MENU,
        position: gmaps.ControlPosition.TOP_RIGHT,
      },
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
    });
    mapRef.current = map;

    const marker = new gmaps.Marker({ position: center, map, draggable: true });
    markerRef.current = marker;

    /* ---- Places Autocomplete on the search input ---- */
    if (searchInputRef.current) {
      const autocomplete = new gmaps.places.Autocomplete(searchInputRef.current, {
        fields: ["geometry", "name"],
        types: ["geocode", "establishment"],
      });
      autocompleteRef.current = autocomplete;

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          marker.setPosition({ lat, lng });
          map.panTo({ lat, lng });
          map.setZoom(15);
          setStagedLat(lat.toFixed(8));
          setStagedLng(lng.toFixed(8));
        }
      });
    }

    /* ---- Map click to place marker ---- */
    map.addListener("click", (e: unknown) => {
      const event = e as { latLng?: LatLng };
      if (!event.latLng) return;
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      marker.setPosition({ lat, lng });
      setStagedLat(lat.toFixed(8));
      setStagedLng(lng.toFixed(8));
    });

    /* ---- Marker dragend ---- */
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (!pos) return;
      const lat = pos.lat();
      const lng = pos.lng();
      setStagedLat(lat.toFixed(8));
      setStagedLng(lng.toFixed(8));
    });

    return () => {
      if (autocompleteRef.current) {
        gmaps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
      gmaps.event.clearInstanceListeners(map);
      gmaps.event.clearInstanceListeners(marker);
      marker.setMap(null);
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen, mapsReady]);

  /* ---- Toggle satellite/roadmap ---- */
  const toggleSatellite = useCallback(() => {
    const gmaps = getGMaps();
    if (!mapRef.current || !gmaps) return;
    const next = !isSatellite;
    setIsSatellite(next);
    mapRef.current.setMapTypeId(
      next ? gmaps.MapTypeId.SATELLITE : gmaps.MapTypeId.ROADMAP,
    );
  }, [isSatellite]);

  /* ---- Confirm selection ---- */
  const handleConfirm = () => {
    if (stagedLat && stagedLng) {
      onLatitudeChange(stagedLat);
      onLongitudeChange(stagedLng);
    }
    setPickerOpen(false);
  };

  /* ---- Cancel ---- */
  const handleCancel = () => {
    setPickerOpen(false);
  };

  /* ---- Clear ---- */
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLatitudeChange("");
    onLongitudeChange("");
  };

  /* ---- Fallback: direct text input ---- */
  if (loadFailed) {
    return (
      <div>
        <label
          htmlFor="coordinates"
          className="block text-sm font-medium text-(--text-primary) mb-1"
        >
          Coordinates <span className="text-red-500">*</span>
        </label>
        <input
          id="coordinates"
          type="text"
          value={displayValue}
          onChange={(e) => {
            const v = e.target.value;
            const parsed = parse(v);
            if (parsed) {
              onLatitudeChange(parsed.lat);
              onLongitudeChange(parsed.lng);
            } else if (!v.trim()) {
              onLatitudeChange("");
              onLongitudeChange("");
            }
          }}
          placeholder="24.6637,93.8725"
          aria-describedby={error ? "coordinates-error" : undefined}
          className={`w-full px-3 py-2 rounded-lg border text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 transition-all placeholder:text-(--text-muted) ${
            error
              ? "border-red-400 focus:ring-red-500/20 focus:border-red-500"
              : "border-(--border-primary) focus:ring-emerald-500/20 focus:border-emerald-500"
          }`}
        />
        {errorMessage && (
          <p id="coordinates-error" className="text-red-500 text-xs mt-1">
            {errorMessage}
          </p>
        )}
        <p className="text-xs text-(--text-muted) mt-1">
          Map unavailable &mdash; enter latitude,longitude manually.
        </p>
      </div>
    );
  }

  /* ---- Normal: read-only input + modal ---- */
  return (
    <div>
      <label
        htmlFor="coordinates"
        className="block text-sm font-medium text-(--text-primary) mb-1"
      >
        Coordinates <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <MapPin
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
        />
        <input
          id="coordinates"
          type="text"
          readOnly
          value={displayValue}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          }}
          placeholder="Click to pick location on map"
          aria-describedby={error ? "coordinates-error" : undefined}
          className={`w-full pl-9 pr-9 py-2 rounded-lg border text-sm bg-(--bg-input) text-(--text-primary) cursor-pointer focus:outline-none focus:ring-2 transition-all placeholder:text-(--text-muted) ${
            error
              ? "border-red-400 focus:ring-red-500/20 focus:border-red-500"
              : "border-(--border-primary) focus:ring-emerald-500/20 focus:border-emerald-500"
          }`}
        />
        {displayValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
            aria-label="Clear coordinates"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {errorMessage && (
        <p id="coordinates-error" className="text-red-500 text-xs mt-1">
          {errorMessage}
        </p>
      )}

      {/* ---- Map modal ---- */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pick location on map"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-(--overlay-bg) backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Panel */}
          <div className="relative w-full max-w-2xl bg-(--bg-card) rounded-xl shadow-2xl border border-(--border-primary) flex flex-col max-h-[90vh] animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-(--border-primary) shrink-0">
              <h3 className="font-semibold text-(--text-primary) text-lg">
                Pick Location
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors text-(--text-secondary) cursor-pointer"
                aria-label="Close map picker"
              >
                <X size={20} />
              </button>
            </div>

            {/* Map area */}
            <div className="p-4 space-y-3">
              {loadFailed ? (
                <div className="w-full h-80 rounded-lg border border-(--border-primary) bg-(--bg-tertiary) flex flex-col items-center justify-center gap-3">
                  <MapPin size={32} className="text-(--text-muted)" />
                  <p className="text-sm text-(--text-muted)">
                    Failed to load Google Maps.
                  </p>
                  <p className="text-xs text-(--text-muted)">
                    Enter coordinates manually in the input field.
                  </p>
                </div>
              ) : !mapsReady ? (
                <div className="w-full h-80 rounded-lg border border-(--border-primary) bg-(--bg-tertiary) flex flex-col items-center justify-center gap-3">
                  <Loader2 size={32} className="text-(--text-muted) animate-spin" />
                  <p className="text-sm text-(--text-muted)">
                    Loading map{mapsLoading ? "..." : ""}
                  </p>
                </div>
              ) : (
                <>
                  {/* Search bar + satellite toggle */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                      />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search for a location..."
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-(--text-muted)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={toggleSatellite}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        isSatellite
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                          : "border-(--border-primary) text-(--text-muted) hover:bg-(--bg-hover)"
                      }`}
                      title={isSatellite ? "Switch to Roadmap" : "Switch to Satellite"}
                      aria-label={isSatellite ? "Switch to Roadmap" : "Switch to Satellite"}
                    >
                      <Satellite size={16} />
                    </button>
                  </div>

                  {/* Status text */}
                  {stagedLat && stagedLng ? (
                    <p className="text-xs text-(--text-secondary)">
                      Selected: {stagedLat}, {stagedLng}
                    </p>
                  ) : (
                    <p className="text-xs text-(--text-muted)">
                      Search, click the map, or drag the marker to pick a location.
                    </p>
                  )}

                  {/* Map canvas */}
                  <div
                    ref={mapDivRef}
                    className="w-full h-80 rounded-lg border border-(--border-primary) bg-(--bg-tertiary)"
                  />
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-(--border-primary) shrink-0">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-(--border-primary) text-(--text-primary) bg-(--bg-secondary) hover:bg-(--bg-hover) transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!stagedLat || !stagedLng}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
