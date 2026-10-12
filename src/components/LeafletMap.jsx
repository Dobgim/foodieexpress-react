import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HQ_POS } from '../lib/catalog';

export const emojiIcon = (emoji, size = 32, anchorBottom = false) =>
  L.divIcon({
    html: `<div class="map-emoji" style="font-size:${size}px">${emoji}</div>`,
    className: 'custom-map-icon',
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, anchorBottom ? size + 4 : (size + 4) / 2],
  });

export async function geocode(query) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
  const results = await res.json();
  if (!results?.length) return null;
  return { pos: [parseFloat(results[0].lat), parseFloat(results[0].lon)], name: results[0].display_name };
}

/** Thin wrapper around a Leaflet map. `onReady(map)` runs once; its return value is called on unmount. */
export function LeafletMap({ onReady, className = 'map', zoom = 13 }) {
  const ref = useRef(null);
  useEffect(() => {
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView(HQ_POS, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    const cleanup = onReady?.(map);
    const t = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(t);
      if (typeof cleanup === 'function') cleanup();
      map.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <div ref={ref} className={className} />;
}
