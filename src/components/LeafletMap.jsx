import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HQ_POS } from '../lib/catalog';

// Lucide icon outlines, inlined because Leaflet markers take plain HTML.
const MARKERS = {
  kitchen: ['#c8102e', '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/>'],
  store: ['#c8102e', '<path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/>'],
  home: ['#1d1411', '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'],
  rider: ['#d97706', '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>'],
  done: ['#2f7d4f', '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'],
};

export const mapIcon = (kind, size = 36) => {
  const [color, svg] = MARKERS[kind];
  const glyph = Math.round(size * 0.5);
  return L.divIcon({
    html: `<div class="map-marker" style="background:${color};width:${size}px;height:${size}px"><svg viewBox="0 0 24 24" width="${glyph}" height="${glyph}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg></div>`,
    className: 'custom-map-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

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
