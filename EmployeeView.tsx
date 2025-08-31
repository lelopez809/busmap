import React from 'react';
import { LocationData, AdditionalBusStatus, GeolocationError } from '../types'; // Keep GeolocationError for driver's error type
import { FirebaseBusData } from '../firebaseService';
import { ClockIcon, AlertTriangleIcon, EyeIcon, SeatIcon, WifiIcon as SignalLostIcon } from './Icons'; // Re-using WifiIcon for signal lost
import LocationDisplayCard from './LocationDisplayCard';
import MapView from './MapView';

interface EmployeeViewProps {
  firebaseBusData: FirebaseBusData | null;
  firebaseListenerError: string | null; // Error from Firebase listener itself
}

const EmployeeView: React.FC<EmployeeViewProps> = ({ firebaseBusData, firebaseListenerError }) => {
  
  const busLocation = firebaseBusData?.location ?? null;
  const isSharing = firebaseBusData?.isSharing ?? false;
  const lastUpdatedAtFirebase = firebaseBusData?.lastUpdatedAt ?? null; // Firebase server timestamp
  const additionalBusStatus = firebaseBusData?.additionalStatus ?? { incidentReported: null, seatsAvailable: null, lastStatusUpdate: null };
  const driverReportedError = firebaseBusData?.driverReportedError ?? null; // Error from driver's device

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  const timeSinceUpdate = (timestamp: number | null): string => {
    if (!timestamp) return 'N/A';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'justo ahora';
    if (seconds < 60) return `hace ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `hace ${hours}h`;
  };
  
  return (
    <div className="w-full max-w-xl bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
      <div className="flex items-center space-x-3">
        <EyeIcon className="w-8 h-8 text-green-400" />
        <h2 className="text-3xl font-bold text-white">Vista Empleado</h2>
      </div>

      {firebaseListenerError && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg relative shadow-md" role="alert">
          <div className="flex items-center">
            <AlertTriangleIcon className="w-6 h-6 mr-3 text-red-300 flex-shrink-0" />
            <div>
              <strong className="font-bold">Error de Conexión:</strong>
              <span className="block sm:inline ml-1">{firebaseListenerError}</span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Bus Status Display from Collaborator */}
      {additionalBusStatus.lastStatusUpdate && (
        <div className="bg-gray-700/70 p-4 rounded-lg shadow-md border border-gray-600/50 space-y-3">
          <h4 className="text-md font-semibold text-sky-300 mb-2">Estado del Viaje (Reportado):</h4>
          {additionalBusStatus.incidentReported !== null && (
            <div className={`flex items-center p-3 rounded-md ${additionalBusStatus.incidentReported ? 'bg-red-800/50 border-red-700' : 'bg-green-800/50 border-green-700'} border`}>
              <AlertTriangleIcon className={`w-5 h-5 mr-2 ${additionalBusStatus.incidentReported ? 'text-red-300' : 'text-green-300'}`} />
              <span className={`${additionalBusStatus.incidentReported ? 'text-red-200' : 'text-green-200'}`}>
                {additionalBusStatus.incidentReported ? 'Incidente/Tapón reportado.' : 'Situación de vía normal.'}
              </span>
            </div>
          )}
          {additionalBusStatus.seatsAvailable !== null && (
             <div className={`flex items-center p-3 rounded-md ${additionalBusStatus.seatsAvailable ? 'bg-sky-800/50 border-sky-700' : 'bg-yellow-800/50 border-yellow-700'} border`}>
              <SeatIcon className={`w-5 h-5 mr-2 ${additionalBusStatus.seatsAvailable ? 'text-sky-300' : 'text-yellow-300'}`} />
              <span className={`${additionalBusStatus.seatsAvailable ? 'text-sky-200' : 'text-yellow-200'}`}>
                {additionalBusStatus.seatsAvailable ? 'Asientos disponibles reportados.' : 'No hay asientos disponibles reportados.'}
              </span>
            </div>
          )}
          <p className="text-xs text-gray-400 text-right">
            Última act. de estado: {formatTime(additionalBusStatus.lastStatusUpdate)} ({timeSinceUpdate(additionalBusStatus.lastStatusUpdate)})
          </p>
        </div>
      )}

      {/* Main Status based on isSharing and errors */}
      {!firebaseBusData && !firebaseListenerError && (
         <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 shadow-md text-center">
          <p className="font-semibold">Conectando para recibir datos del autobús...</p>
        </div>
      )}
      
      {firebaseBusData && !isSharing && !driverReportedError && ( 
        <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 shadow-md text-center">
          <p className="font-semibold">El autobús no está compartiendo su ubicación actualmente.</p>
          {busLocation && <p className="text-sm">Mostrando última ubicación conocida si está disponible.</p>}
        </div>
      )}

      {isSharing && driverReportedError && ( 
        <div className="bg-yellow-900 border border-yellow-700 text-yellow-100 px-4 py-3 rounded-lg relative shadow-md" role="alert">
          <div className="flex items-center">
            <SignalLostIcon className="w-6 h-6 mr-3 text-yellow-300" /> {/* Using WifiIcon as SignalLostIcon */}
            <div>
              <strong className="font-bold">Problema con la Ubicación del Conductor:</strong>
              <span className="block sm:inline ml-1">
                El dispositivo del conductor reportó un error (Cód: {driverReportedError.code}): {driverReportedError.message}.
              </span>
              <span className="block text-sm mt-1">Podría mostrarse la última ubicación conocida.</span>
            </div>
          </div>
        </div>
      )}
      
      {isSharing && !driverReportedError && !busLocation && (
         <div className="p-4 bg-blue-800 border border-blue-700 rounded-lg text-blue-100 shadow-md text-center">
          <p className="font-semibold">El autobús está compartiendo. Esperando la primera actualización de ubicación...</p>
        </div>
      )}

      {/* Location Display: shows current if sharing and no error, or last known if sharing with error or not sharing but location exists */}
      {busLocation && (
        <div className="space-y-4">
          <MapView latitude={busLocation.latitude} longitude={busLocation.longitude} />
          <LocationDisplayCard 
            location={busLocation} 
            lastUpdatedAt={typeof lastUpdatedAtFirebase === 'number' ? lastUpdatedAtFirebase : null}
          />
        </div>
      )}
      
      {isSharing && !driverReportedError && busLocation && (
         <div className="p-3 bg-green-800/70 border border-green-700/50 rounded-lg text-green-100 shadow-md text-xs text-center">
          <p className="font-medium">Recibiendo actualizaciones de ubicación en tiempo real.</p>
        </div>
      )}
      
      {!isSharing && firebaseBusData && !busLocation && !driverReportedError && (
         <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 shadow-md text-center">
            <p className="font-semibold">El autobús no está compartiendo y no hay última ubicación conocida.</p>
        </div>
      )}


    </div>
  );
};

export default EmployeeView;