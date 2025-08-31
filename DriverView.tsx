import React from 'react';
import { LocationData, GeolocationError, AdditionalBusStatus } from '../types';
import { PlayIcon, StopIcon, MapPinIcon, AlertTriangleIcon, ClockIcon, SeatIcon } from './Icons';
import LocationDisplayCard from './LocationDisplayCard';
import MapView from './MapView';

interface DriverViewProps {
  roleTitle: string;
  startSharing: () => void;
  stopSharing: () => void;
  isSharing: boolean;
  currentLocation: LocationData | null;
  error: GeolocationError | null;
  lastUpdatedAt: number | null;
  additionalBusStatus: AdditionalBusStatus;
  reportIncident: (isIncident: boolean) => void;
  reportSeatAvailability: (areSeatsAvailable: boolean) => void;
}

const DriverView: React.FC<DriverViewProps> = ({
  roleTitle,
  startSharing,
  stopSharing,
  isSharing,
  currentLocation,
  error,
  lastUpdatedAt,
  additionalBusStatus,
  reportIncident,
  reportSeatAvailability,
}) => {

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="w-full max-w-lg bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
      <div className="flex items-center space-x-3">
        <MapPinIcon className="w-8 h-8 text-blue-400" />
        <h2 className="text-3xl font-bold text-white">{roleTitle}</h2>
      </div>
      
      <div className="space-y-4">
        {!isSharing ? (
          <button
            onClick={startSharing}
            className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105"
            aria-label="Iniciar compartición de ubicación"
          >
            <PlayIcon className="w-5 h-5" />
            <span>Iniciar Compartición</span>
          </button>
        ) : (
          <button
            onClick={stopSharing}
            className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105"
            aria-label="Detener compartición de ubicación"
          >
            <StopIcon className="w-5 h-5" />
            <span>Detener Compartición</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg relative shadow-md" role="alert">
          <div className="flex items-center">
            <AlertTriangleIcon className="w-6 h-6 mr-3 text-red-300 flex-shrink-0" />
            <div>
              <strong className="font-bold">Error (Código: {error.code}):</strong>
              <span className="block sm:inline ml-1">{error.message}</span>
              {error.code === 1 && error.message.toLowerCase().includes('permissions policy') && (
                <p className="text-sm mt-2 text-red-200">
                  <strong>Sugerencia:</strong> Este error a menudo significa que tu navegador o la configuración del sitio web (Política de Permisos) están bloqueando el acceso a la ubicación.
                  Por favor, revisa los permisos del sitio en tu navegador para esta página y asegúrate de que el acceso a la ubicación esté permitido.
                  Si esta página está incrustada (por ejemplo, en un iframe), el sitio principal también podría necesitar otorgar permiso a través de su política.
                </p>
              )}
              {error.code === 1 && !error.message.toLowerCase().includes('permissions policy') && (
                <p className="text-sm mt-2 text-red-200">
                  <strong>Sugerencia:</strong> Es posible que hayas denegado el acceso a la ubicación para este sitio. Por favor, revisa los permisos del sitio en tu navegador y asegúrate de que el acceso a la ubicación esté permitido.
                </p>
              )}
              {error.code === 2 && ( 
                  <p className="text-sm mt-2 text-red-200">
                      <strong>Sugerencia:</strong> El dispositivo no puede determinar su posición. Esto puede suceder si los servicios de ubicación (GPS, Wi-Fi, red) están desactivados o no funcionan. Revisa la configuración de ubicación de tu dispositivo y la conexión de red.
                  </p>
              )}
              {error.code === 3 && ( 
                  <p className="text-sm mt-2 text-red-200">
                      <strong>Sugerencia:</strong> Tomó demasiado tiempo obtener la ubicación. Esto podría deberse a una señal GPS débil o problemas de red. Intenta moverte a un área con una vista más clara del cielo o revisa tu conexión de red.
                  </p>
              )}
               {error.code === 0 && ( 
                  <p className="text-sm mt-2 text-red-200">
                      <strong>Información:</strong> {error.message}. Intenta usar un navegador diferente o asegúrate de que el actual esté actualizado.
                  </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isSharing && !error && (
        <div className="p-4 bg-green-800 border border-green-700 rounded-lg text-green-100 shadow-md">
            <p className="font-semibold text-center">La compartición de ubicación está activa.</p>
        </div>
      )}
      {!isSharing && !error && (
         <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 shadow-md">
            <p className="font-semibold text-center">La compartición de ubicación está inactiva. Presiona 'Iniciar' para comenzar.</p>
        </div>
      )}

      {currentLocation && (
        <div className="space-y-4">
          <MapView latitude={currentLocation.latitude} longitude={currentLocation.longitude} />
          <LocationDisplayCard location={currentLocation} lastUpdatedAt={lastUpdatedAt} />
        </div>
      )}
      
      {isSharing && !currentLocation && !error && (
        <div className="p-4 bg-yellow-800 border border-yellow-700 rounded-lg text-yellow-100 shadow-md text-center">
            <p className="font-semibold">Adquiriendo ubicación inicial...</p>
        </div>
      )}

      {/* Reporting Section - Now available for both Driver and Collaborator */}
      <div className="pt-6 border-t border-gray-700 space-y-6">
        <h3 className="text-xl font-semibold text-sky-300 flex items-center">
          <AlertTriangleIcon className="w-6 h-6 mr-2 text-sky-400" />
          Reportar Estado del Viaje
        </h3>
        
        {/* Incident Reporting */}
        <div className="bg-gray-700/50 p-4 rounded-lg shadow">
          <p className="font-medium text-gray-200 mb-1">Incidentes (Accidente/Tapón):</p>
          <p className="text-sm text-gray-400 mb-3">
            Estado Actual: <span className={`font-semibold ${additionalBusStatus.incidentReported === true ? 'text-red-400' : additionalBusStatus.incidentReported === false ? 'text-green-400' : 'text-gray-500'}`}>
              {additionalBusStatus.incidentReported === true ? 'Incidente Reportado' : additionalBusStatus.incidentReported === false ? 'Situación Normal' : 'Aún no informado'}
            </span>
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => reportIncident(true)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm transition"
              disabled={additionalBusStatus.incidentReported === true}
            >
              Reportar Incidente
            </button>
            <button
              onClick={() => reportIncident(false)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md text-sm transition"
              disabled={additionalBusStatus.incidentReported === false}
            >
              Situación Normal
            </button>
          </div>
        </div>

        {/* Seat Availability Reporting */}
        <div className="bg-gray-700/50 p-4 rounded-lg shadow">
          <p className="font-medium text-gray-200 mb-1">Disponibilidad de Asientos:</p>
          <p className="text-sm text-gray-400 mb-3">
            Estado Actual: <span className={`font-semibold ${additionalBusStatus.seatsAvailable === true ? 'text-green-400' : additionalBusStatus.seatsAvailable === false ? 'text-yellow-400' : 'text-gray-500'}`}>
              {additionalBusStatus.seatsAvailable === true ? 'Sí, Quedan Asientos' : additionalBusStatus.seatsAvailable === false ? 'No Quedan Asientos' : 'Aún no informado'}
            </span>
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => reportSeatAvailability(true)}
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-md text-sm transition"
              disabled={additionalBusStatus.seatsAvailable === true}
            >
              Sí Quedan Asientos
            </button>
            <button
              onClick={() => reportSeatAvailability(false)}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md text-sm transition"
              disabled={additionalBusStatus.seatsAvailable === false}
            >
              No Quedan Asientos
            </button>
          </div>
        </div>
          {additionalBusStatus.lastStatusUpdate && (
          <div className="text-xs text-gray-500 text-center flex items-center justify-center">
            <ClockIcon className="w-3 h-3 mr-1" />
            <span>Última act. de estado: {formatTime(additionalBusStatus.lastStatusUpdate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverView;