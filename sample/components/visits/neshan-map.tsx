"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export type MapMarker = Coordinates & {
  id: string;
  title?: string;
  description?: string;
};

type NeshanMapProps = {
  center?: Coordinates;
  zoom?: number;
  markers?: MapMarker[];
  onLocationSelect?: (coords: Coordinates) => void;
  interactive?: boolean;
  className?: string;
};

type NeshanModule = typeof import("@neshan-maps-platform/mapbox-gl");
type NeshanMapInstance = InstanceType<NeshanModule["Map"]>;
type NeshanMarkerInstance = InstanceType<NeshanModule["Marker"]>;

const DEFAULT_CENTER: Coordinates = { latitude: 35.6892, longitude: 51.389 };
const DEFAULT_ZOOM = 11;
const MARKER_COLOR = "#2563eb";

let sdkPromise: Promise<NeshanModule> | null = null;
function loadNeshanSdk(): Promise<NeshanModule> {
  if (!sdkPromise) {
    sdkPromise = import("@neshan-maps-platform/mapbox-gl");
  }
  return sdkPromise;
}

export function NeshanMap({
  center,
  zoom = DEFAULT_ZOOM,
  markers = [],
  onLocationSelect,
  interactive = false,
  className = "",
}: NeshanMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<NeshanMapInstance | null>(null);
  const markerInstancesRef = useRef<NeshanMarkerInstance[]>([]);
  const sdkRef = useRef<NeshanModule | null>(null);
  const clickHandlerRef = useRef<((event: { lngLat: { lat: number; lng: number } }) => void) | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const resolvedCenter = useMemo(() => center ?? DEFAULT_CENTER, [center]);
  const publicKey = process.env.NEXT_PUBLIC_NESHAN_API_KEY;

  useEffect(() => {
    if (!publicKey) {
      setError("کلید API نقشه نشان تنظیم نشده است.");
      return;
    }
    let isUnmounted = false;

    loadNeshanSdk()
      .then((sdk) => {
        if (isUnmounted) {
          return;
        }
        sdkRef.current = sdk;

        if (!containerRef.current) {
          return;
        }

        const map = new sdk.Map({
          container: containerRef.current,
          mapKey: publicKey,
          mapType: sdk.Map.mapTypes.neshanVector,
          center: [resolvedCenter.longitude, resolvedCenter.latitude],
          zoom,
          pitch: 0,
          minZoom: 3,
          maxZoom: 21,
          poi: true,
          traffic: false,
          interactive: true,
        });

        mapInstanceRef.current = map;
        setIsReady(true);
      })
      .catch((sdkError) => {
        console.error("[NeshanMap] SDK load error:", sdkError);
        setError("بارگذاری نقشه نشان با خطا مواجه شد.");
      });

    return () => {
      isUnmounted = true;
      markerInstancesRef.current.forEach((marker) => marker.remove());
      markerInstancesRef.current = [];
      if (clickHandlerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.off("click", clickHandlerRef.current);
      }
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      sdkRef.current = null;
      clickHandlerRef.current = null;
    };
  }, [publicKey, resolvedCenter.latitude, resolvedCenter.longitude, zoom]);

  useEffect(() => {
    if (!isReady || !mapInstanceRef.current) {
      return;
    }

    if (!interactive || !onLocationSelect) {
      if (clickHandlerRef.current) {
        mapInstanceRef.current.off("click", clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
      return;
    }

    const handler = (event: { lngLat: { lat: number; lng: number } }) => {
      const { lat, lng } = event.lngLat || {};
      if (typeof lat !== "number" || typeof lng !== "number") {
        return;
      }
      onLocationSelect({ latitude: lat, longitude: lng });
    };

    mapInstanceRef.current.on("click", handler);
    clickHandlerRef.current = handler;

    return () => {
      if (clickHandlerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.off("click", clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
    };
  }, [interactive, onLocationSelect, isReady]);

  useEffect(() => {
    if (!isReady || !mapInstanceRef.current) {
      return;
    }
    mapInstanceRef.current.setCenter([resolvedCenter.longitude, resolvedCenter.latitude]);
  }, [resolvedCenter.latitude, resolvedCenter.longitude, isReady]);

  useEffect(() => {
    if (!isReady || !mapInstanceRef.current) {
      return;
    }
    mapInstanceRef.current.setZoom(zoom);
  }, [zoom, isReady]);

  useEffect(() => {
    if (!isReady || !mapInstanceRef.current || !sdkRef.current) {
      return;
    }

    markerInstancesRef.current.forEach((marker) => marker.remove());
    markerInstancesRef.current = [];

    if (!markers.length) {
      return;
    }

    const { Marker, Popup } = sdkRef.current;

    markers.forEach((marker) => {
      try {
        const markerInstance = new Marker({ color: MARKER_COLOR })
          .setLngLat([marker.longitude, marker.latitude])
          .addTo(mapInstanceRef.current!);

        if ((marker.title || marker.description) && Popup) {
          const popup = new Popup({
            closeButton: false,
            offset: 16,
          }).setHTML(
            `<div dir="rtl" style="font-size:12px;color:#0f172a;">
               ${marker.title ? `<strong>${marker.title}</strong><br/>` : ""}
               ${marker.description ?? ""}
             </div>`,
          );
          markerInstance.setPopup(popup);
        }

        markerInstancesRef.current.push(markerInstance);
      } catch (markerError) {
        console.error("[NeshanMap] Marker error:", markerError);
      }
    });
  }, [markers, isReady]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${className}`}>
      {error ? (
        <div className="flex h-64 items-center justify-center text-sm text-rose-600">{error}</div>
      ) : (
        <div ref={containerRef} className="h-64 w-full" />
      )}
      {!error && interactive && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 w-72 -translate-x-1/2 rounded-full bg-slate-900/70 px-4 py-2 text-center text-xs text-white shadow-lg">
          روی نقشه کلیک کنید تا مختصات انتخاب شود
        </div>
      )}
    </div>
  );
}

