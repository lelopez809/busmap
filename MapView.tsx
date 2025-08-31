import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';

interface MapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

// Custom animated icon for the bus
const busIcon = new L.DivIcon({
  className: 'pulsing-marker',
  iconSize: [20, 20], // size of the icon
  iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -10] // point from which the popup should open relative to the iconAnchor
});


// Component to update map center when props change, without resetting the user's zoom.
const ChangeView = ({ center }: { center: LatLngExpression }) => {
    const map = useMap();
    // Use an effect to pan to the new center whenever the 'center' prop changes.
    // map.panTo() smoothly moves the map without affecting the zoom level set by the user.
    useEffect(() => {
        map.panTo(center);
    }, [center, map]);
    return null;
}

// This component runs logic when the map is ready to fix potential sizing issues.
const MapInitializer = () => {
    const map = useMap();
    useEffect(() => {
        // This is a common fix for a race condition where the map initializes
        // before its container div has been properly sized by CSS.
        // A small delay ensures the container is ready before invalidating size.
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

const MapView: React.FC<MapViewProps> = ({ latitude, longitude, zoom = 16 }) => {
  const position: LatLngExpression = [latitude, longitude];

  // A basic guard against invalid coordinates that might break Leaflet
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return (
        <div className="w-full h-64 bg-gray-700 rounded-lg shadow-inner flex items-center justify-center p-4 text-center">
            <p className="text-gray-400">Esperando coordenadas válidas para mostrar el mapa.</p>
        </div>
    );
  }

  return (
    <div className="w-full h-64 bg-gray-700 rounded-lg shadow-inner overflow-hidden border border-gray-600">
      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapInitializer />
        {/* This component now only receives the center, allowing the user to control the zoom freely after initial load. */}
        <ChangeView center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={position} icon={busIcon}>
          <Popup>
            Ubicación actual del autobús.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;