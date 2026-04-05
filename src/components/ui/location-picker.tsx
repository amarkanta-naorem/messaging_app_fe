"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { MapPin, X, Loader2, Search, Satellite, AlertCircle } from "lucide-react";

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

export interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onLatitudeChange: (v: string) => void;
  onLongitudeChange: (v: string) => void;
  error?: boolean;
  errorMessage?: string;
}

export function LocationPicker({ latitude, longitude, onLatitudeChange, onLongitudeChange, error = false, errorMessage }: LocationPickerProps) {
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

  const displayValue = compose(latitude, longitude);
  const openPicker = useCallback(() => {
    setStagedLat(latitude || "");
    setStagedLng(longitude || "");
    setIsSatellite(false);
    setPickerOpen(true);
  }, [latitude, longitude]);

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
    const center = hasCoords ? { lat: parseFloat(stagedLat), lng: parseFloat(stagedLng) } : DEFAULT_CENTER;
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

    map.addListener("click", (e: unknown) => {
      const event = e as { latLng?: LatLng };
      if (!event.latLng) return;
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      marker.setPosition({ lat, lng });
      setStagedLat(lat.toFixed(8));
      setStagedLng(lng.toFixed(8));
    });

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
  }, [pickerOpen, mapsReady]);

  const toggleSatellite = useCallback(() => {
    const gmaps = getGMaps();
    if (!mapRef.current || !gmaps) return;
    const next = !isSatellite;
    setIsSatellite(next);
    mapRef.current.setMapTypeId(next ? gmaps.MapTypeId.SATELLITE : gmaps.MapTypeId.ROADMAP,);
  }, [isSatellite]);

  const handleConfirm = () => {
    if (stagedLat && stagedLng) {
      onLatitudeChange(stagedLat);
      onLongitudeChange(stagedLng);
    }
    setPickerOpen(false);
  };

  const handleCancel = () => {
    setPickerOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLatitudeChange("");
    onLongitudeChange("");
  };

  const hasValue = displayValue.length > 0;

  if (loadFailed) {
    return (
      <div className="relative">
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
          aria-required="true"
          aria-invalid={error || undefined}
          aria-describedby={error ? "coordinates-error" : "coordinates-hint"}
          className={`
            peer w-full px-4 py-3 pt-5 pb-2 pl-10 rounded-xl border text-sm transition-all duration-200
            bg-(--bg-input) text-(--text-primary)
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${error 
              ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" 
              : "border-(--border-primary) focus:ring-emerald-500/20 focus:border-emerald-500"
            }
          `}
        />
        <label
          htmlFor="coordinates"
          className={`
            absolute left-10 transition-all duration-200 pointer-events-none text-(--text-muted) text-sm
            ${hasValue 
              ? "top-2 text-xs text-(--text-primary)" 
              : "top-1/2 -translate-y-1/2 text-sm"
            }
            ${error ? (hasValue ? " text-red-400" : "") : ""}
            peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-500
          `}
        >
          Coordinates <span className="text-red-500">*</span>
        </label>
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
        {error && errorMessage && (
          <div id="coordinates-error" className="flex items-center gap-1.5 mt-1.5" role="alert">
            <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <p className="text-red-500 text-xs">{errorMessage}</p>
          </div>
        )}
        <p id="coordinates-hint" className="text-xs text-(--text-muted) mt-1.5">Map unavailable &mdash; enter latitude,longitude manually.</p>
      </div>
    );
  }

  return (
    <div className="relative">
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
        aria-required="true"
        aria-invalid={error || undefined}
        aria-describedby={error ? "coordinates-error" : undefined}
        className={`
          peer w-full px-4 py-3 pt-5 pb-2 pl-10 pr-10 rounded-xl border text-sm transition-all duration-200
          bg-(--bg-input) text-(--text-primary) cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error 
            ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" 
            : "border-(--border-primary) focus:ring-emerald-500/20 focus:border-emerald-500"
          }
        `}
      />
      <label
        htmlFor="coordinates"
        className={`
          absolute left-10 transition-all duration-200 pointer-events-none text-(--text-muted) text-sm
          ${hasValue 
            ? "top-2 text-xs text-(--text-primary)" 
            : "top-1/2 -translate-y-1/2 text-sm"
          }
          ${error ? (hasValue ? " text-red-400" : "") : ""}
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-500
        `}
      >
        Coordinates <span className="text-red-500">*</span>
      </label>
      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
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
      {error && errorMessage && (
        <div id="coordinates-error" className="flex items-center gap-1.5 mt-1.5" role="alert">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <p className="text-red-500 text-xs">{errorMessage}</p>
        </div>
      )}

      {pickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Pick location on map">
          <div className="absolute inset-0 bg-(--overlay-bg) backdrop-blur-sm" onClick={handleCancel}/>
          <div className="relative w-full max-w-2xl bg-(--bg-card) rounded-xl shadow-2xl border border-(--border-primary) flex flex-col max-h-[90vh] animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-(--border-primary) shrink-0">
              <h3 className="font-semibold text-(--text-primary) text-lg">Pick Location</h3>
              <button onClick={handleCancel} className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors text-(--text-secondary) cursor-pointer" aria-label="Close map picker">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {loadFailed ? (
                <div className="w-full h-80 rounded-lg border border-(--border-primary) bg-(--bg-tertiary) flex flex-col items-center justify-center gap-3">
                  <MapPin size={32} className="text-(--text-muted)" />
                  <p className="text-sm text-(--text-muted)">Failed to load Google Maps.</p>
                  <p className="text-xs text-(--text-muted)">Enter coordinates manually in the input field.</p>
                </div>
              ) : !mapsReady ? (
                <div className="w-full h-80 rounded-lg border border-(--border-primary) bg-(--bg-tertiary) flex flex-col items-center justify-center gap-3">
                  <Loader2 size={32} className="text-(--text-muted) animate-spin" />
                  <p className="text-sm text-(--text-muted)">Loading map{mapsLoading ? "..." : ""}</p>
                </div>
              ) : (
                <>
                  {/* Search bar + satellite toggle */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"/>
                      <input ref={searchInputRef} type="text" placeholder="Search for a location..." className="w-full pl-8 pr-3 py-2 rounded-lg border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-(--text-muted)"/>
                    </div>
                    <button
                      type="button"
                      onClick={toggleSatellite}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${isSatellite ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : "border-(--border-primary) text-(--text-muted) hover:bg-(--bg-hover)"}`}
                      title={isSatellite ? "Switch to Roadmap" : "Switch to Satellite"}
                      aria-label={isSatellite ? "Switch to Roadmap" : "Switch to Satellite"}
                    >
                      <Satellite size={16} />
                    </button>
                  </div>

                  {stagedLat && stagedLng ? (
                    <p className="text-xs text-(--text-secondary)">Selected: {stagedLat}, {stagedLng}</p>
                  ) : (
                    <p className="text-xs text-(--text-muted)">Search, click the map, or drag the marker to pick a location.</p>
                  )}

                  <div ref={mapDivRef} className="w-full h-80 rounded-lg border border-(--border-primary) bg-(--bg-tertiary)"/>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-(--border-primary) shrink-0">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium rounded-lg border border-(--border-primary) text-(--text-primary) bg-(--bg-secondary) hover:bg-(--bg-hover) transition-colors cursor-pointer">Cancel</button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!stagedLat || !stagedLng}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Pin This Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
