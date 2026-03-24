"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export default function MapInner({
  items,
}: {
  items: Array<{ name: string; latitude: string; longitude: string; address: string }>;
}) {
  const center: [number, number] = items.length
    ? [Number(items[0].latitude), Number(items[0].longitude)]
    : [-1.9441, 30.0619];

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10">
      <MapContainer center={center} zoom={13} className="h-[360px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map((item) => (
          <Marker
            key={item.name}
            position={[Number(item.latitude), Number(item.longitude)]}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{item.name}</div>
                <div>{item.address}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

