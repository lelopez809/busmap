import React from 'react';
import { LocationData } from '../types';
import { ClockIcon, WifiIcon, ChevronRightIcon, CompassIcon } from './Icons';

interface LocationDisplayCardProps {
  location: LocationData;
  lastUpdatedAt: number | null;
}

const LocationDisplayCard: React.FC<LocationDisplayCardProps> = ({ location, lastUpdatedAt }) => {
  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  const timeSinceUpdate = (timestamp: number | null): string => {
    if (!timestamp) return 'N/A';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 2) return 'justo ahora';
    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };

  return (
    <div className="bg-gray-700/50 backdrop-blur-sm p-5 rounded-lg shadow-xl border border-gray-600/50">
      <h3 className="text-lg font-semibold text-blue-300 mb-4 tracking-wide">Detalles de la Transmisión</h3>
      <div className="space-y-3">
        {typeof location.accuracy === 'number' && (
          <div className="flex items-center text-gray-200">
            <WifiIcon className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" /> 
            <span>Precisión: {location.accuracy.toFixed(1)} metros</span>
          </div>
        )}
        {typeof location.speed === 'number' && location.speed !== null && (
          <div className="flex items-center text-gray-200">
            <ChevronRightIcon className="w-5 h-5 mr-3 text-yellow-400 flex-shrink-0" />
            <span>Velocidad: {(location.speed * 3.6).toFixed(1)} km/h ({location.speed.toFixed(1)} m/s)</span>
          </div>
        )}
        {typeof location.heading === 'number' && location.heading !== null && (
           <div className="flex items-center text-gray-200">
            <CompassIcon className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
            <span>Rumbo: {location.heading.toFixed(0)}°</span>
          </div>
        )}
        <div className="flex items-center text-gray-200">
          <ClockIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
          <span>Hora del Dispositivo: {formatTime(location.timestamp)}</span>
        </div>
        {lastUpdatedAt && (
          <div className="flex items-center text-sm text-gray-400 pt-3 border-t border-gray-600/70 mt-3">
            <ClockIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Última Sincronización: {formatTime(lastUpdatedAt)} ({timeSinceUpdate(lastUpdatedAt)})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDisplayCard;